const Discord = require('discord.js');
const functions = require('../assets/functions.js');
const package = functions.package();

module.exports = {
    event: "messageDelete",
    /**
     * @param {Discord.Message} message 
     */
    execute: (message) => {
        if (!message.guild) return;

        if (!message.channel.snipes) {
            message.channel.snipes = new Discord.Collection();
            message.channel.snipes.set(0, message);
        } else {
            message.channel.snipes.set(message.channel.snipes.length, message);
        };

        let log = package.embeds.classic(message.author)
            .setTitle("Message supprimé")
            .setColor('#ff0000')
            .setDescription(`Un message de <@${message.author.id}> a été supprimé`)
            .addFields(
                {
                    name: "Message",
                    value: `\`${message.id}\`. Envoyé <t:${(message.createdTimestamp / 1000).toFixed(0)}:F> ( <t:${(message.createdTimestamp / 1000).toFixed(0)}:R> ) par <@${message.author.id}> ( ${message.author.tag} \`${message.author.id}\` )`,
                    inline: true
                },
                {
                    name: "Salon",
                    value: `<#${message.channel.id}> ( ${message.channel.name} \`${message.channel.id}\` )`,
                    inline: true
                },
                {
                    name: "Contenu",
                    value: message.content ?? message.embeds[0]?.description ?? "Pas de contenu",
                    inline: false
                }
            );
        message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' }).then((result) => {
            if (result.entries.first()?.target.id == message.id) {
                const mod = result.entries.first().executor;
                if (mod) {
                    const content = log.fields.splice(2, 1, {
                        name: "Modérateur",
                        value: `<@${mod.id}> ( ${mod.tag} \`${mod.id}\` )`,
                        inline: true
                    });

                    log.addField(content);
                };
            };

            functions.log(message.guild, log);
        })
    }
}