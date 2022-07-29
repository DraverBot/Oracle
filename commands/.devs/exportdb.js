const { Message, Client } = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const fs = require('fs');
const moment = require('moment');

module.exports = {
    help: {
        name: 'exportdb',
        description: "Exporte la base de données",
        aliases: [],
        permissions: [],
        private: true,
        dm: false,
        cooldown: 0
    },
    /**
     * @param {Message} message 
     * @param {Array} args 
     * @param {Client} client 
     */
    run: async(message, args, client) => {
        let sql = `Base de données Oracle

`;

        const msg = await functions.reply(message, package.embeds.waitForDb(message.author));

        client.db.query(`SHOW TABLES FROM YeikzyBot`, (err, rawTables) => {
            if (err) {
                msg.edit({ embeds: [ package.embeds.errorSQL(message.author) ] });
                console.log(err);
                return;
            };
            const tables = rawTables.map(x => x['Tables_in_YeikzyBot']);
            
            tables.forEach((table, index) => {
                client.db.query(`DESCRIBE ${table}`, (er, tableData) => {
                    if (er) {
                        msg.edit({ embeds: [ package.embeds.errorSQL(message.author) ] });
                        console.log(er);
                        return;
                    };
                    let structure = `CREATE TABLE ${table} (
${tableData.map((x) => `                        ${x.Field} ${x.Type.toUpperCase()} ${x.Null == 'NO' ? 'NOT NULL':''} ${x.Default == null ? '': `DEFAULT ${x.Default == "current_timestamp()" ? "CURRENT_TIMESTAMP" : `"${x.Default}"`}`}`).join(',\n')}
                    );`;

                    let primaryKey = tableData.find(x => x.Key && x.Key == 'PRI');
                    if (primaryKey) structure+=`\n\nALTER TABLE ${table} ADD PRIMARY KEY ( ${primaryKey.Field} );`;

                    sql+=structure;
                    sql+="\n\n";

                    client.db.query(`SELECT * FROM ${table}`, (e, request) => {
                        if (e) {
                            msg.edit({ embeds: [ package.embeds.errorSQL(message.author) ] });
                            console.log(e);
                            return;
                        };
                        let data = `INSERT INTO ${table} ( ${tableData.map(x => x.Field).join(', ')} ) VALUES ${request.map(x => `(${Object.values(x).map(y => `"${y}"`).join(', ')})`).join(',\n')};`

                        if (request.length > 0) sql+=data + '\n\n';

                        if (index + 1 == tables.length) {
                            fs.writeFileSync(`./assets/db/saves/${moment(Date.now()).format('YYYY-MM-DD_hh-mm')}.txt`, sql);

                            msg.edit({ embeds: [ package.embeds.classic(message.author)
                                .setTitle("Base de données exportée")
                                .setDescription(`La base de données a été exportée et mise sur l'hébergeur ( \`assets/db/saves\` )`)
                                .setColor('ORANGE')
                            ] });
                        };
                    });
                });
            })
        });
    }
}