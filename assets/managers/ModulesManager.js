const Discord = require('discord.js');
const functions = require('../functions');
const package = functions.package();
const mysql = require('mysql');

class ModulesManager {
    /**
     * @param {Discord.Client} client 
     * @param {mysql.Connection} db 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
        this.cache = new Map();
        this._params = [];
    }
    /**
     * @returns {{ name: String, state: Boolean }[]}
     */
    get params() {
        return this._params;
    }
    formatToObject(data) {
        let x = data;
        Object.keys(x).filter(y => y != 'guild_id' && typeof x[y] == 'string').forEach((key) => {
            x[key] = x[key] == '1';
        });
        
        return x;
    }
    formatToSql(data) {
        let x = data;
        Object.keys(x).filter(y => y !== 'guild_id' && typeof x[y] == 'boolean').forEach((key) => {
            x[key] = x[key] == true ? '1':'0'
        });
        
        return x;
    }
    createQuery(data) {
        let x = this.formatToSql(data);

        let sql = `UPDATE modules SET ${Object.keys(x).map(y => `${y}="${x[y]}"`).join(', ')} WHERE guild_id="${x.guild_id}"`;
        if (!this.cache.has(x.guild_id)) sql = `INSERT INTO modules (${Object.keys(x).join(', ')}) VALUES (${Object.values(x).map(y => `"${y}"`).join(', ')})`;

        return sql;
    }
    query(sql) {
        this.db.query(sql, (err) => {
            if (err) throw err;
            this.fillCache();
        });
    }
    resetCache() {
        this.cache = new Map();
    }
    fillCache() {
        this.db.query(`SELECT * FROM modules`, (err, request) => {
            if (err) throw err;

            this.resetCache();
            for (const req of request) {
                let data = this.formatToObject(req);
                this.cache.set(req.guild_id, data);
            };
        });
    }
    init() {
        const modules = require(`../data/modules.json`);
        
        this.db.query(`DESCRIBE modules`, (err, req) => {
            if (err) throw err;

            let values = req.filter(x => x.Type == 'tinyint(1)');
            let data = values.map(x => ({ name: x.Field, state: x.Default == "1" }));

            let toAdd = modules.filter(x => !data.find(y => x.value == y.name));
            let toRemove = data.filter(x => !modules.find(y => x.name == y.value));
            
            toAdd.forEach((x) => {
                data.push({
                    name: x.value,
                    state: x.default
                });
            });
            toRemove.forEach((x, i) => {
                data.splice(i, 1);
            });

            this._params = data;
            let stop = false;
            if (toAdd.length > 0) {
                this.db.query(`ALTER TABLE modules ADD (${toAdd.map(x => `${x.value} TINYINT(1) NOT NULL DEFAULT "${x.default == true ? '1':'0'}"`).join(', ')})`, (err) => {
                    if (err) throw err;

                    this.fillCache();
                });
                stop = true;
            };
            if (toRemove.length > 0) {
                this.db.query(`ALTER TABLE modules ${toRemove.map(x => `DROP ${x.name}`).join(', ')}`, (err) => {
                    if (err) throw err;

                    this.fillCache();
                });
                stop = true;
            };

            if (stop) return;
            this.fillCache();
        });
    }
    /**
     * @param {String} guildId 
     */
    checkIfExists(guildId) {
        if (!this.cache.has(guildId)) {
            this.cache.set(guildId, {guild_id: guildId});
            const sql = this.createQuery({ guild_id: guildId });
            this.query(sql);
        };
    }
    /**
     * @param {{ module: String, guildId: String }} data 
     */
    checkModule(data) {
        if (!this.cache.has(data.guildId)) {
            this.checkIfExists(data.guildId);
            return false;
        };

        let x = this.cache.get(data.guildId);
        x = this.formatToObject(x);
        
        return x[data.module] ?? require('../data/modules.json').find(x => x.value == data.module).default;
    }
    /**
     * @param {{ module: String, guildId: String, state: Boolean }} data 
     */
    setModule(data) {
        let x = this.cache.get(data.guildId) || { guild_id: data.guildId };
        x[data.module] = data.state;

        let sql = this.createQuery(this.formatToSql(x));
        this.query(sql);
        return data.state;
    }
};

module.exports = ModulesManager;