const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'channelCreate',
    /**
     * @param {Discord.NonThreadGuildBasedChannel} channel 
     */
    execute: (channel) => {
        if (!channel.guild) return;

        channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' }).then((entries) => {
            let log = package.embeds.log(channel.guild)
                .setTitle("Salon crée")
                .setColor('#00ff00')

            if (entries.entries.first().target.id == channel.id) {
                const mod = entries.entries.first().executor;
                log.setDescription(`Un [salon](https://discord.com/channels/${channel.guild.id}/${channel.id}) a été crée`)
                .addFields(
                    {
                        name: "Modérateur",
                        value: `<@${mod.id}> ( ${mod.tag} \`${mod.id}\` )`,
                        inline: true
                    },
                    {
                        name: 'Salon',
                        value: `<#${channel.id}> ( ${package.channelTypes[channel.type]} \`${channel.id}\` )`,
                        inline: true
                    },
                    {
                        name: "Date",
                        value: `<t:${(Date.now() / 1000).toFixed(0)}:F> ( <t:${(Date.now() / 1000).toFixed(0)}:R> )`,
                        inline: true
                    }
                )
            } else {
                log.setDescription(`Le salon <#${channel.id}> ( ${package.channelTypes[channel.type]} \`${channel.id}\` ) a été crée`)
            };

            functions.log(channel.guild, log);
        });
    }
}