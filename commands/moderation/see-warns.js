const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const moment = require('moment');

moment.locale('fr');

module.exports.help = {
    name: 'see-warns',
    aliases: ['infractions', 'seewarns'],
    description: "Montre les avertissements d'un utilisateur.",
    permissions: ['manage_guild'],
    dm: false,
    private: false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) return message.channel.send({ embeds: [ package.embeds.noUser(message.author) ] });

    if (!functions.checkAllConditions(message.guild, message.channel, message.member, member)) return;

    client.db.query(`SELECT * FROM mod_cases WHERE action="warn" AND guild_id="${message.guild.id}" AND user_id="${member.id}"`, (err, req) => {
        if (err) {
            console.log(err);
            return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
        };

        if (req.length === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Pas d'avertissements")
            .setDescription(`<@${member.id}> n'a aucun avertissement sur ce serveur.`)
            .setColor('GREEN')
        ] });

        if (req.length > 5) {
            let now = package.embeds.classic(message.author)
                .setTitle("Avertissement")
                .setDescription(`Voici la liste des avertissements de <@${member.id}>.`)
                .setColor('ORANGE')
            
            var embeds = [];
            let pile = false;
            let count = 0;
            
            for (let i = 0; i < req.length; i++) {
                const warn = req[i];
                
                now.addField(`Avertissement`, `> Donné par <@${warn.mod_id}>\n> Raison: \`${warn.reason}\`\n> Date: <t:${moment(warn.date).unix()}:R>`, false);

                pile = false;

                count++;
                if (count === 5) {
                    count=0;
                    pile = true;
                    embeds.push(now);

                    now = null;
                    now = package.embeds.classic(message.author)
                        .setTitle("Avertissements")
                        .setDescription(`Voici la liste des avertissements de <@${member.id}>.`)
                        .setColor('ORANGE')

                }
            };

            if (!pile) embeds.push(now);
            
            functions.pagination(message.author, message.channel, embeds, `avertissements de \`${member.user.tag}\``);
        } else {
            const embed = package.embeds.classic(message.author)
                .setTitle("Avertissements")
                .setColor('ORANGE')
                .setDescription(`<@${member.id}> a **${req.length}** avertissements`)
                .setColor('ORANGE')

            req.forEach((warn) => {
                embed.addField(`Avertissement`, `> Donné par <@${warn.mod_id}>\n> Raison: \`${warn.reason}\`\n> Date: <t:${moment(warn.date).unix()}:R>`, false);
            });

            message.channel.send({ embeds: [ embed ] });
        }
    })
};