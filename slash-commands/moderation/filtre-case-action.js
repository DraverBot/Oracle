const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const moment = require('moment');

module.exports = {
    configs: {
        name: 'filtre-case-action',
        description: "Affiche tout les logs de modération concernant une action précisée",
        options: [
            {
                name: 'action',
                description: "L'action a afficher",
                required: true,
                autocomplete: false,
                type: 'STRING',
                choices: [
                    {
                        name: 'Bannissements',
                        value: 'ban'
                    },
                    {
                        name: 'Avertissements',
                        value: 'avertissement'
                    },
                    {
                        name: 'Réduction au silence',
                        value: 'mute'
                    },
                    {
                        name: 'Expulsion',
                        value: 'kick'
                    },
                    {
                        name: 'Démutage',
                        value: 'unmute'
                    },
                    {
                        name: 'Suppression d\'avertissements',
                        value: 'unwarn'
                    },
                    {
                        name: 'Débanissement',
                        value: "unban"
                    },
                    {
                        name: "Modification de pseudo",
                        value: 'pseudo modifié'
                    },
                    {
                        name: "Réinitialisation de pseudo",
                        value: 'pseudo réinitialisé'
                    }
                ]
            }
        ]
    },
    help: {
        dm: false,
        dev: false,
        permissions: ['manage_guild'],
        systems: [{name: 'de logs', value: 'logs_enable', state: true}],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const action = interaction.options.get('action').value;

        interaction.client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${interaction.guild.id}" AND action="${action}"`, (err, req) => {
            if (err) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });

            if (req.length === 0) return interaction.reply({ content: "Il n'y aucun log à afficher" });

            if (req.length > 5) {
                let now = package.embeds.classic(interaction.user)
                    .setTitle("Logs")
                    .setDescription(`Voici la liste des logs de ${action}.`)
                    .setColor('ORANGE')
                    
                var embeds = [];
                let pile = false;
                let count = 0;
                    
                for (let i = 0; i < req.length; i++) {
                    const warn = req[i];
                        
                    now.addField(action, `<@${warn.user_id}>\n> Donné par <@${warn.mod_id}>\n> Raison: ${warn.reason}\n> Date: <t:${moment(warn.date).unix()}:R>`, false);
        
                    pile = false;

                    count++;
                    if (count === 5) {
                        count=0;
                        pile = true;
                        embeds.push(now);
        
                        now = null;
                        now = package.embeds.classic(interaction.user)
                            .setTitle("Logs")
                            .setDescription(`Voici la liste des logs de ${action}.`)
                            .setColor('ORANGE')
                    }
                };
        
                if (!pile) embeds.push(now);
                    
                functions.pagination(interaction.user, interaction.channel, embeds, `logs de modération`);
                interaction.reply({ content: "Voici la liste de modération", ephemeral: true });
            } else {
                const embed = package.embeds.classic(interaction.user)
                    .setTitle("Logs")
                    .setColor('ORANGE')
                    .setDescription(`Voici la liste des logs de ${action}`)
                    
                req.forEach((warn) => {
                    embed.addField(action, `<@${warn.user_id}>\n> Donné par <@${warn.mod_id}>\n> Raison: ${warn.reason}\n> Date: <t:${moment(warn.date).unix()}:R>`, false);
                });

                interaction.reply({ embeds: [ embed ] });
            }
        })
    }
}