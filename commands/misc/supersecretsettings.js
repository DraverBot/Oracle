const Discord = require('discord.js');
const functions = require('../../assets/functions.js');
const package = functions.package();

module.exports.help = {
    name: 'super-secret-settings',
    appear: false,
    permissions: [],
    aliases: ['supersecretsettings', 'sss'],
    cooldown: 5,
    private: false,
    dm: true
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    message.delete().catch(console.log);

    client.db.query(`SELECT secret_setting FROM configs WHERE guild_id="${message.guild.id}"`, (err, req) => {
        if (err) return console.log(err);
        if (req.length === 0) return;

        let sql;
        
        if (req[0].secret_setting === 0) {
            message.channel.send({ content: "Vous avez **activé** les paramètres super secrets :detective:" });
            sql = 1;
        } else {
            message.channel.send({ content: "Vous avez **désactivé** les paramètres super secrets :detective:" });
            sql = 0;
        };
        let query = `UPDATE configs SET secret_setting="${sql}" WHERE guild_id="${message.guild.id}"`;
        client.db.query(query, e => e?console.log:null);
    })
}