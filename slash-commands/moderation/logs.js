const Discord = require('discord.js');
const moment = require('moment');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        systems: [{name: 'de logs', value: 'logs_enable', state: true}],
        permissions: ['manage_guild']
    },
    configs: {
        name: 'logs',
        description: "Gère les logs du serveur",
        options: [
            {
                name: "afficher",
                description: "Affiche les logs du serveur",
                type: 'SUB_COMMAND'
            },
            {
                name: 'identifier',
                description: "Affiche un log spécifique",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'identifiant',
                        description: "Identifiant du log que vous voulez voir",
                        type: 'STRING',
                        required: true
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] }).catch(() => {});
        const subcommand = interaction.options.getSubcommand();

        if (subcommand == 'afficher') {
            interaction.client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                if (err) {
                    functions.sendError(err, 'query fetch at /logs afficher', interaction.user);
                    interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    return;
                };
                
                if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("🚫 Logs de modération")
                    .setDescription(`Il n'y a aucun log de modération.`)
                    .setColor('ORANGE')
                ] }).catch(() => {});
        
                if (req.length > 5) {
                    let now = package.embeds.classic(interaction.user)
                        .setTitle("Logs de modération")
                        .setDescription(`Voici les logs de modération (**${req.length.toLocaleString('fr-DE')}** logs).`)
                        .setColor('ORANGE')
            
                    var embeds = [];
                    let pile = false;
                    let count = 0;
                            
                    for (let i = 0; i < req.length; i++) {
                        const warn = req[i];
                                
                        now.addField(`${warn.action}`, `<@${warn.user_id}>\n> Donné par <@${warn.mod_id}>\n> Raison: \`${warn.reason}\`\n> Date: <t:${moment(warn.date).unix()}:F>\n*Log id: ${warn.case_id}*`, false);
        
                        pile = false;
            
                        count++;
                        if (count === 5) {
                            count=0;
                            pile = true;
                            embeds.push(now);
            
                            now = null;
                            now = package.embeds.classic(interaction.user)
                                .setTitle("Logs de modération")
                                .setDescription(`Voici les logs de modération (**${req.length.toLocaleString('fr-DE')}** logs).`)
                                .setColor('ORANGE')
                        };
                    };
            
                    if (!pile) embeds.push(now);
                        
                    functions.pagination(interaction.user, 'none', embeds, 'modlogs', interaction);
                } else {
                    const embed = package.embeds.classic(interaction.user)
                        .setTitle("Logs de modération")
                        .setColor('ORANGE')
                        .setDescription(`voici les logs de modération.`)
        
                    req.forEach((warn) => {
                        embed.addField(`${warn.action}`, `<@${warn.user_id}>\n> Donné par <@${warn.mod_id}> <t:${moment(warn.date).unix()}:R>\n> Raison: \`${warn.reason}\`\n> Date: <t:${moment(warn.date).unix()}:F>\n*Log id: ${warn.case_id}*`, false);
                    });
        
                    interaction.editReply({ embeds: [ embed ] }).catch(() => {});
                }
            })
        };
        if (subcommand == 'identifier') {
            let id = interaction.options.getString('identifiant');
            interaction.client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${interaction.guild.id}" AND case_id="${id}"`, (err, req) => {
                if (err) {
                    interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    functions.sendError(err, 'query at /logs identifier', interaction.user);
                    return;
                };
                if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("🚫 Pas de log")
                    .setDescription(`Le log avec \`${id}\` pour identifiant n'existe pas`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                const log = req[0];
                const modlog = package.embeds.classic(interaction.user)
                    .setTitle(log.action)
                    .addFields(
                        {
                            name: "Membre",
                            value: `<@${log.user_id}> (\`${log.user_id}\`)`,
                            inline: true
                        },
                        {
                            name: "Modérateur",
                            value: `<@${log.mod_id}> (\`${log.mod_id}\`)`,
                            inline: true
                        },
                        {
                            name: "Raison",
                            value: log.reason ?? "Pas de raison",
                            inline: true
                        },
                        {
                            name: "Date",
                            value: `<t:${moment(log.date).unix()}:F>`,
                            inline: false
                        }
                    )
                
                interaction.editReply({ embeds: [ modlog ] }).catch(() => {});
            });
        }
    }
}