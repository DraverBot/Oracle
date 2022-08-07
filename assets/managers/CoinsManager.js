const Discord = require('discord.js');

const CoinsManager = class CoinsManager {
    /**
     * @param {Discord.Client} client 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
        this.coins = new Discord.Collection();
    }
    /**
     * @param {{ user_id: String, guild_id: String }} ids 
     * @param {?Boolean} refill default is true
     */
    set(ids, refill) {
        if (!this.has(this.getCode(ids))) {
            this.db.query(`INSERT INTO coins (guild_id, user_id, coins, bank) VALUES ("${ids.guild_id}", "${ids.user_id}", "0", "100")`, (e) => {
                if (refill == false) return;
                this.fillCache();
            });
        };
    }
    has(code) {
        return this.coins.has(code);
    }
    splitCode(code) {
        return { user_id: code.split('.')[1], guild_id: code.split('.')[0] };
    }
    save(code) {
        const stats = this.getStats(code);
        const ids = this.splitCode(code);

        this.db.query(`UPDATE coins SET coins="${stats.coins}", bank="${stats.bank}" WHERE user_id="${ids.user_id}" AND guild_id="${ids.guild_id}"`, (e) => {
            if (e) console.log(e);
        })
    }
    getStats(code) {
        return this.coins.get(code);
    }
    getCode(data) {
        return `${data.guild_id}.${data.user_id}`;
    }
    /**
     * @param {{ user_id: String, guild_id: String }} ids 
     * @returns 
     */
    addCoins(ids, amount) {
        const code = this.getCode(ids);
        this.set(ids, false);

        if (!this.has(code)) {
            this.coins.set(code, { coins: 0, bank: 100 });
        };

        const stats = this.getStats(code);
        stats.coins+= amount;

        this.coins.set(code, stats);
        this.save(code);

        return stats;
    }
    /**
     * @param {{ user_id: String, guild_id: String }} ids 
     */
    removeCoins(ids, amount) {
        const code = this.getCode(ids);
        if (!this.has(code)) return false;

        const stats = this.getStats(code);
        if (stats.coins < amount) return 'not enough coins';

        stats.coins-=amount;
        this.coins.set(code, stats);
        this.save(code);

        return stats;
    }
    /**
     * @param {{ user_id: String, guild_id: String }} ids 
     * @description Dépose de l'argent dans la banque
     * @returns 
     */
    deposit(ids, amount) {
        const code = this.getCode(ids);
        if (!this.has(code)) return false;

        const stats = this.getStats(code);
        const result = this.removeCoins(ids, amount);
        if (result == 'not enough coins') return result;

        stats.bank+= amount;
        this.coins.set(code, stats);
        this.save(code);

        return stats;
    }
    /**
     * @param {{ user_id: String, guild_id: String }} ids 
     * @description Récupère de l'argent depuis sa banque
     * @returns 
     */
    withdraw(ids, amount) {
        const code = this.getCode(ids);
        if (!this.has(code)) return false;

        const stats = this.getStats(code);
        if (stats.bank < amount) return 'not enough coins';

        stats.coins+= amount;
        stats.bank-= amount;

        this.coins.set(code, stats);
        this.save(code);
        return stats;
    }
    /**
     * @param {String} guild_id 
     */
    getGuild(guild_id) {
        return this.coins.map((value, key) => {
            let splited = this.splitCode(key);
            if (splited.guild_id !== guild_id) return;
            
            return {
                coins: value,
                user: splited.user_id
            };
        });
    }
    resetGuild(guild_id) {
        this.db.query(`DELETE FROM coins WHERE guild_id="${guild_id}"`, (err, req) => {
            if (err) throw err;

            this.fillCache();
        });
    }
    /**
     * @param {{ user_id: String, guild_id: String }} ids 
     */
    resetUser(ids) {
        this.db.query(`DELETE FROM coins WHERE guild_id="${ids.guild_id}" AND user_id="${ids.user_id}"`, (err, req) => {
            if (err) throw err;
            this.fillCache();
        })
    }
    clearCache() {
        this.coins = new Discord.Collection();
    }
    fillCache() {
        this.db.query(`SELECT * FROM coins`, (err, req) => {
            if (err) throw err;
            this.clearCache();

            req.forEach(line => {
                this.coins.set(this.getCode(line), { coins: parseInt(line.coins), bank: parseInt(line.bank) });
            });
        });
    }
    init() {
        this.fillCache();
        console.log(`Coins manager is ready.`);
    }
};

module.exports = CoinsManager;