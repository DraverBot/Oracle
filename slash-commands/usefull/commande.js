const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'commande',
        description: "Affiche les informations concernant une commande",
        options: [
            {
                name: 'commande',
                description: "Nom de la commande",
                required: true,
                autocomplete: false,
                type: 'STRING'
            },
            {
                name: 'discret',
                description: "Fait en sorte que seul vous voit la réponse.",
                required: false,
                autocomplete: false,
                type: 'BOOLEAN'
            }
        ]
    },
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        const ephemeral = interaction.options.get('discret') ? interaction.options.get('discret').value : false;

        const commandName = interaction.options.get('commande').value;
        const commandList = require('../../assets/data/slashCommands');

        let command = commandList.get(commandName);

        if (!command || command.help.private || (command.help.appear !== undefined && command.help.appear === false)) return interaction.reply({ content: "Cette commande n'existe pas.", ephemeral: ephemeral });

        const perms = package.perms;
        
        let embed = package.embeds.classic(interaction.user)
            .setTitle(`Commande ${command.configs.name}`)
            .setDescription(`**Description:** \`\`\`${command.configs.description}\`\`\``)
            .addFields(
                {
                    name: "Cooldown",
                    value: `${command.help.cd} seconde(s)`,
                    inline: true
                },
                {
                    name: "Systèmes",
                    value: command.help.systems?.length === 0 ? "Aucun système requis" : command.help.systems.map((system) => `Système ${system.name} : doit être **${system.state == true ? 'activé':'désactivé'}**`).join(', '),
                    inline: true
                },
                {
                    name: "Permissions",
                    value: command.help.permissions?.length === 0 ? 'Aucune permission nécéssaires' : command.help.permissions.map((perm) => '`' + perms[perm.toUpperCase()] + '`').join(', '),
                    inline: true
                },
                {
                    name: '\u200b',
                    value: "\u200b",
                    inline: false
                },
                {
                    name: "Exécutable en privé ?",
                    value: command.help.dm ? "Oui" : "Non",
                    inline: true
                }
            )
        .setColor('ORANGE')
        /**
         * @param {Discord.ApplicationCommandSubCommandData[]} subCommandsList 
         */
        const generateSubCommandsRow = (subCommandsList) => {
            return subCommandsList.map(sub => ({ label: sub.name, description: sub.description, value: sub.name }));
        };
        const generateRow = () => {
            let rows = [];
            let groups = new Discord.MessageSelectMenu()
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Choississez un groupe de sous-commandes')
                .setCustomId('sub-commands-group')
            let subCommands = new Discord.MessageSelectMenu()
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Choisissez une sous-commande')
                .setCustomId('sub-commands')
                
            const subs = command.configs.options.filter(x => x.type == 'SUB_COMMAND');
            const subsGroups = command.configs.options.filter(x => x.type == 'SUB_COMMAND_GROUP');
            if (subs.length > 0) subCommands.setOptions(generateSubCommandsRow(subs));
            if (subsGroups.length > 0) groups.setOptions(generateSubCommandsRow(subsGroups));

            groups = new Discord.MessageActionRow()
                .addComponents(groups);
            subCommands = new Discord.MessageActionRow()
                .addComponents(subCommands);
            
            if (subs.length > 0 && subsGroups.length > 0) rows.push(groups) & rows.push(subCommands);
            else if (subs.length == 0 && subsGroups.length > 0) rows.push(groups);
            else rows.push(subCommands);

            return rows;
        };
        let rows = [];
        
        const optionsTypes = {
            ROLE: 'rôle',
            CHANNEL: 'salon',
            STRING: "texte",
            INTEGER: 'nombre',
            NUMBER: 'nombre',
            ATTACHMENT: 'fichier',
            USER: 'utilisateur',
            BOOLEAN: 'binaire'
        };
        const menu = new Discord.MessageButton({ label: 'Menu', customId: 'menu', style: 'SECONDARY', emoji: '🏠' });
        if (command.configs.options?.length > 0) {
            if (!['SUB_COMMAND_GROUP', 'SUB_COMMAND'].includes(command.configs.options[0].type)) {
                embed.addFields(
                    {
                        name: "Options",
                        value: command.configs.options.map(opt => `\`${opt.name}\` (${optionsTypes[opt.type]}) : ${opt.description}${opt.required == true ? ' - **requis**':''}`).join('\n'),
                        inline: true
                    }
                );
            } else {
                rows = generateRow();
                rows.push(new Discord.MessageActionRow()
                    .addComponents(menu)
                );
            };
        };

        interaction.reply({ embeds: [ embed ], ephemeral: ephemeral, components: rows }).catch((e) => {console.log(e)});
        
        if (rows.length > 0) {
            const reply = await interaction.fetchReply();
            const collector = reply.createMessageComponentCollector({ time: 120000, filter: x => x.user.id == interaction.user.id });
            
            collector.on('collect', /**@param {Discord.SelectMenuInteraction}int */ (int) => {
                collector.resetTimer();
                int.deferUpdate();

                if (int.customId == 'sub-commands') {
                    let inGroup = false;
                    let group;

                    let subCommand = command.configs.options.find(x => (x.type == 'SUB_COMMAND' && x.name == int.values[0]) || x.options && x.options.find(y => {
                        if (y.type == 'SUB_COMMAND' && y.name == int.values[0]) {
                            inGroup = true;
                            group = x.name;
                            return true;
                        };
                    }));
                    if (subCommand.type == 'SUB_COMMAND_GROUP') subCommand = subCommand.options.find(x => x.name == int.values[0]);
                    embed.setFields();
                    embed.setDescription(`Sous commande \`/${command.configs.name} ${inGroup ? group + ' ' + subCommand.name : subCommand.name}\``);
                    embed.addFields(
                        {
                            name: 'Description',
                            value: subCommand.description,
                            inline: false
                        },
                        {
                            name: 'Options',
                            value: subCommand.options?.length > 0 ? subCommand.options.map(opt => `\`${opt.name}\` (${optionsTypes[opt.type]}) : ${opt.description}${opt.required == true ? ' - **requis**':''}`).join('\n') : "Pas d'options",
                            inline: false
                        }
                    );

                    interaction.editReply({ embeds: [ embed ] }).catch(() => {});
                } else if (int.customId == 'sub-commands-group') {
                    let group = command.configs.options.find(x => x.type == 'SUB_COMMAND_GROUP' && x.name == int.values[0]);
                    const row = new Discord.MessageActionRow();
                    
                    const selector = new Discord.MessageSelectMenu()
                        .setMaxValues(1)
                        .setMinValues(1)
                        .setPlaceholder('Choisissez une sous-commande')
                        .setOptions(group.options.map(x => ({ label: x.name, description: x.description, value: x.name })))
                        .setCustomId('sub-commands')
                    row.addComponents(selector);

                    embed.setFields();
                    embed.setDescription(`Groupe de sous-commandes \`${command.configs.name} ${group.name}\``)
                    embed.addFields(
                        {
                            name: "Description",
                            value: group.description,
                            inline: true
                        }
                    );

                    interaction.editReply({ embeds: [ embed ], components: [ row, new Discord.MessageActionRow({ components: [ menu ] }) ] }).catch((e) => {console.log(e)});
                } else if (int.customId == 'menu') {
                    embed = package.embeds.classic(interaction.user)
                    .setTitle(`Commande ${command.configs.name}`)
                    .setDescription(`**Description:** \`\`\`${command.configs.description}\`\`\``)
                    .addFields(
                        {
                            name: "Cooldown",
                            value: `${command.help.cd} seconde(s)`,
                            inline: true
                        },
                        {
                            name: "Systèmes",
                            value: command.help.systems?.length === 0 ? "Aucun système requis" : command.help.systems.map((system) => `Système ${system.name} : doit être **${system.state == true ? 'activé':'désactivé'}**`).join(', '),
                            inline: true
                        },
                        {
                            name: "Permissions",
                            value: command.help.permissions?.length === 0 ? 'Aucune permission nécéssaires' : command.help.permissions.map((perm) => '`' + perms[perm.toUpperCase()] + '`').join(', '),
                            inline: true
                        },
                        {
                            name: '\u200b',
                            value: "\u200b",
                            inline: false
                        },
                        {
                            name: "Exécutable en privé ?",
                            value: command.help.dm ? "Oui" : "Non",
                            inline: true
                        }
                    )
                    .setColor('ORANGE')
                    rows = [];
                    
                    if (command.configs.options?.length > 0) {
                        if (!['SUB_COMMAND_GROUP', 'SUB_COMMAND'].includes(command.configs.options[0].type)) {
                            embed.addFields(
                                {
                                    name: "Options",
                                    value: command.configs.options.map(opt => `\`${opt.name}\` (${optionsTypes[opt.type]}) : ${opt.description}${opt.required == true ? ' - **requis**':''}`).join('\n'),
                                    inline: true
                                }
                            );
                        } else {
                            rows = generateRow();
                            rows.push(new Discord.MessageActionRow()
                                .addComponents(menu)
                            );
                        };
                    };

                    interaction.editReply({ embeds: [ embed ], components: rows }).catch(() => {});
                };
            });
        }
    }
}