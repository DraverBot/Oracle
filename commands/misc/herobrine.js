const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'herobrine',
        appear: false,
        dm: false,
        private: false,
        permissions: ['administrator'],
        aliases: [],
        description: ".",
        cooldown: 5
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     * @param {Discord.Client} client 
     * @param {String} prefix 
     */
    run: (message, args, client, prefix) => {
        message.delete().catch(() => {});

        client.db.query(`SELECT * FROM configs WHERE guild_id="${message.guild.id}"`, (err, req) => {
            if (err) return console.log(err) & message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
            if (req.length === 0) return;

            if (req[0].herobrine_active === 0) {
                message.guild.channels.create('herobrine', {
                    reason: "Herobrine"
                }).then((chan) => {
                    chan.send({ content: `https://thumbs.gfycat.com/MiserlyDopeyEsok-small.gif` }).catch(() => {});
                    client.db.query(`UPDATE configs SET herobrine_channel="${chan.id}", herobrine_active="1" WHERE guild_id="${message.guild.id}"`, (e) => e?console.log:null);
                });
            } else {
                client.db.query(`UPDATE configs SET herobrine_channel="", herobrine_active="0" WHERE guild_id="${message.guild.id}"`, (e)=>e?console.log:null);
                setTimeout(() => {
                    message.guild.channels.cache.get(req[0].herobrine_channel).delete('deleted herobrine').catch(() => {});
                }, 5000);
            };
        });
    }
};