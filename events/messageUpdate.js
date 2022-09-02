const { run } = require('../assets/message');
const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'messageUpdate',
    /**
     * @param {Discord.Message} b 
     * @param {Discord.Message} a 
     */
    execute: (b, a) => {
        if (a.content == b.content) return;

        if (b.guild) {
            const embed = package.embeds.classic(a.author)
                .setTitle("Message édité")
                .setDescription(`Le [message](${a.url}) de <@${a.id}> a été modifié dans <#${a.channel.id}>`)
                .addFields(
                    {
                        name: "Avant",
                        value: b.content || '\u200b',
                        inline: false
                    },
                    {
                        name: "Après",
                        value: a.content || '\u200b',
                        inline: false
                    }
                )
                .setColor('ORANGE')
            
            functions.log(a.guild, embed);
        };
        // run(a);
    }
};