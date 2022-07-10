const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const moment = require('moment');
moment.locale('fr');

module.exports.help = {
    name: 'modlogs',
    description: "Affiche les logs de modération",
    aliases: [],
    permissions: ['manage_guild'],
    private: false,
    dm: false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${message.guild.id}"`, (err, req) => {
        if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

        if (req.length === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Logs de modération")
            .setDescription(`Il n'y a aucun log de modération.`)
            .setColor('GREEN')
        ] });

        if (req.length > 5) {
            let now = package.embeds.classic(message.author)
                .setTitle("Logs de modération")
                .setDescription(`Voici les logs de modération (**${req.length}** logs).`)
                .setColor('ORANGE')
    
            var embeds = [];
            let pile = false;
            let count = 0;
                    
            for (let i = 0; i < req.length; i++) {
                const warn = req[i];
                        
                now.addField(`${warn.action}`, `<@${warn.user_id}>\n> Donné par <@${warn.mod_id}>\n> Raison: \`${warn.reason}\`\n> Date: <t:${moment(warn.date).unix()}:R>\n*Log id: ${warn.case_id}*`, false);

                pile = false;
    
                count++;
                if (count === 5) {
                    count=0;
                    pile = true;
                    embeds.push(now);
    
                    now = null;
                    now = package.embeds.classic(message.author)
                        .setTitle("Logs de modération")
                        .setDescription(`Voici les logs de modération (**${req.length}** logs).`)
                        .setColor('ORANGE')
                }
            };
    
            if (!pile) embeds.push(now);
                
            functions.pagination(message.author, message.channel, embeds, `modlogs`);
        } else {
            const embed = package.embeds.classic(message.author)
                .setTitle("Logs de modération")
                .setColor('ORANGE')
                .setDescription(`voici les logs de modération.`)
                .setColor('ORANGE')

            req.forEach((warn) => {
                embed.addField(`${warn.action}`, `<@${warn.user_id}>\n> Donné par <@${warn.mod_id}> <t:${moment(warn.date).unix()}:R>\n> Raison: \`${warn.reason}\`\n> Date: <t:${moment(warn.date).unix()}:R>\n*Log id: ${warn.case_id}*`, false);
            });

            message.channel.send({ embeds: [ embed ] });
        }
    })
};