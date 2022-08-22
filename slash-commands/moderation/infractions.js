const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const moment = require('moment');

module.exports = {
    help: {
        cd: 5,
        permissions: ['manage_guild'],
        dev: false,
        dm: false
    },
    configs: {
        name: 'infractions',
        description: "Affiche toutes les infractions d'un utilisateur",
        options: [
            {
                name: 'membre',
                description: "Membre dont vous voulez voir les infractions",
                required: false,
                type: 'USER'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let member = interaction.options.getMember('membre') ?? interaction.member;
        await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] }).catch(() => {});

        interaction.client.db.query(`SELECT * FROM mod_cases WHERE user_id="${member.id}" AND guild_id="${interaction.guild.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, 'query fetch at /infractions', interaction.user);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                return;
            };

            if (req.length === 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Pas d'infractions")
                .setDescription(`<@${member.id}> n'a aucune infraction sur ce serveur.`)
                .setColor('GREEN')
            ] });
    
            if (req.length > 5) {
                let now = package.embeds.classic(interaction.user)
                    .setTitle("Infractions")
                    .setDescription(`Voici la liste des infractions de <@${member.id}>.`)
                    .setColor('ORANGE')
                
                var embeds = [];
                let pile = false;
                let count = 0;
                
                for (let i = 0; i < req.length; i++) {
                    const warn = req[i];
                    
                    now.addField(`Infraction`, `${warn.action}\n> Donné par <@${warn.mod_id}>\n> Raison: ${warn.reason}\n> Date: <t:${moment(warn.date).unix()}:R>`, false);
    
                    pile = false;
    
                    count++;
                    if (count === 5) {
                        count=0;
                        pile = true;
                        embeds.push(now);
    
                        now = null;
                        now = package.embeds.classic(interaction.user)
                            .setTitle("Infractions")
                            .setDescription(`Voici la liste des infractions de <@${member.id}>.`)
                            .setColor('ORANGE')
    
                    }
                };
    
                if (!pile) embeds.push(now);
                
                functions.pagination(interaction.user, 'none', embeds, `infractions de ${member.user.tag}`, interaction);
            } else {
                const embed = package.embeds.classic(interaction.user)
                    .setTitle("Infractions")
                    .setColor('ORANGE')
                    .setDescription(`<@${member.id}> a **${req.length}** infractions`)
                    .setColor('ORANGE')
    
                req.forEach((warn) => {
                    embed.addField(`Infraction`, `${warn.action}\n> Donné par <@${warn.mod_id}>\n> Raison: ${warn.reason}\n> Date: <t:${moment(warn.date).unix()}:R>`, false);
                });
    
                interaction.editReply({ embeds: [ embed ] });
            };
        })
    }
}