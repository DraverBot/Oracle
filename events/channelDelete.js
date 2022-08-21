const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'channelDelete',
    /**
     * @param {Discord.NonThreadGuildBasedChannel} channel 
     */
    execute: (channel) => {
        if (!channel.guild) return;
        channel.client.db.query(`SELECT * FROM configs WHERE guild_id="${channel.guild.id}"`, (err, req) => {
            if (err) return console.log(err);
            if (req.length === 0) return;

            if (req[0].herobrine_active === 0) return;
            if (!req[0].herobrine_channel === channel.id) return;

            channel.guild.channels.create('herobrine', {
                reason: "Herobrine"
            }).then((chan) => {
                chan.send({ content: `https://thumbs.gfycat.com/MiserlyDopeyEsok-small.gif` }).catch(() => {});
                channel.client.db.query(`UPDATE configs SET herobrine_channel="${chan.id}" WHERE guild_id="${channel.guild.id}"`, (e) => e?console.log:null);
            });
        });

        channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' }).then((entries) => {
            let log = package.embeds.log(channel.guild)
                .setTitle("Salon supprimé")
            if (entries.entries.first().target.id == channel.id) {
                log.setDescription(`Un salon a été supprimé`)
                .setColor('#ff0000')
            } else {
                
            }
        })
    }
};