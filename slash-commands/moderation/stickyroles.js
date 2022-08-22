const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        permissions: ['manage_roles', 'manage_guild']
    },
    configs: {
        name: 'stickyroles',
        description: "Gère les rôles collants d'un membre",
        options: [
            {
                name: "info",
                description: "Affiche les informations sur les rôles collants",
                type: 'SUB_COMMAND'
            },
            {
                name: 'coller',
                type: 'SUB_COMMAND',
                description: "Ajoute un rôle collant à un membre",
                options: [
                    {
                        name: 'rôle',
                        description: "Rôle collant à coller",
                        type: 'ROLE',
                        required: true
                    },
                    {
                        name: 'membre',
                        description: "Membre qui prendra le rôle collant",
                        type: 'USER',
                        required: true
                    }
                ]
            },
            {
                name: 'décoller',
                type: 'SUB_COMMAND',
                description: "Retire un rôle collant à un membre",
                options: [
                    {
                        name: 'rôle',
                        description: "Rôle collant à décoller",
                        type: 'ROLE',
                        required: true
                    },
                    {
                        name: 'membre',
                        description: "Membre qui perdra le rôle collant",
                        type: 'USER',
                        required: true
                    }
                ]
            },
            {
                name: 'liste',
                type: 'SUB_COMMAND',
                description: "Affiche la liste des rôles collants d'un membre",
                options: [
                    {
                        name: 'membre',
                        type: 'USER',
                        description: "Membre dont vous voulez voir les rôles collants",
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
        const subcommand = interaction.options.getSubcommand();
        if (subcommand == 'info') {
            let components = [];
            if (functions.random(10, 5) == 7) {
                components.push(new Discord.MessageActionRow()
                    .setComponents(
                        new Discord.MessageButton({
                            label: 'Serveur de support',
                            style: 'LINK',
                            url: package.configs.support
                        })
                    )
                );
            };
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Rôles collants")
                .setDescription(`Les rôles collants sont des rôles attribués à des membres, qui ne sont pas enlevables.\n\nCes rôles sont collés au membre et ne peuvent être retirés qu'avec la commande \`/stickyroles décoller\``)
                .setColor(interaction.guild.me.displayHexColor)
            ], components }).catch(() => {});
            return;
        };

        await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] }).catch(() => {});
        let member = interaction.options.getMember('membre');
        interaction.client.db.query(`SELECT role_id FROM stickyroles WHERE guild_id="${interaction.guild.id}" AND user_id="${member.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, 'query fetch at /stickyroles ' + subcommand, interaction.user);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
            };

            if (subcommand == 'coller') {
                let role = interaction.options.getRole('rôle');
                if (!functions.checkPerms({ mod: interaction.member, member, interaction, checkBotCompare: true, checkOwner: true, checkSelfUser: true, checkRole: { activated: true, role } })) return;

                if (req.find(x => x.role_id == role.id)) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôle déjà collant")
                    .setDescription(`Ce rôle est déjà collant pour <@${member.id}>`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                if (!member.roles.cache.has(role)) member.roles.add(role).catch(() => {});
                interaction.client.db.query(`INSERT INTO stickyroles (guild_id, user_id, role_id) VALUES ("${interaction.guild.id}", "${member.id}", "${role.id}")`, (error) => {
                    if (error) {
                        functions.sendError(error, 'query insert at /stickyroles coller', interaction.user);
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    };

                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Rôle collé")
                        .setDescription(`Le rôle <@&${role.id}> a été collé à <@${member.id}>`)
                        .setColor(role.hexColor)
                    ] }).catch(() => {});
                    functions.log(interaction.guild, package.embeds.logs(interaction.guild)
                        .setTitle("Rôle collé")
                        .setDescription(`Un rôle a été collé à un membre`)
                        .setFields(
                            {
                                name: "Modérateur",
                                value: `<@${interaction.user.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`,
                                inline: true
                            },
                            {
                                name: "Membre",
                                value: `<@${member.id}> ( ${member.user.tag} \`${member.id}\` )`,
                                inline: true
                            },
                            {
                                name: "Rôle",
                                value: `<@&${role.id}> ( @${role.name} \`${role.id}\` )`,
                                inline: true
                            },
                            {
                                name: 'Date',
                                value: `<t:${(Date.now() / 1000).toFixed(0)}:F> ( <t:${(Date.now() / 1000).toFixed(0)}:R> )`,
                                inline: false
                            }
                        )
                        .setColor(role.hexColor)
                    )
                })
            };
            if (subcommand == 'décoller') {
                let role = interaction.options.getRole('rôle');
                if (!functions.checkPerms({ mod: interaction.member, member, interaction, checkBotCompare: true, checkOwner: true, checkSelfUser: true, checkRole: { activated: true, role } })) return;

                if (!req.find(x => x.role_id == role.id)) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôle non collé")
                    .setDescription(`Ce rôle n'est pas collé à <@${member.id}>`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                if (member.roles.cache.has(role)) member.roles.remove(role).catch(() => {});
                interaction.client.db.query(`DELETE FROM stickyroles WHERE guild_id="${interaction.guild.id}" AND user_id="${member.id}" AND role_id="${role.id}"`, (error) => {
                    if (error) {
                        functions.sendError(error, 'query delete at /stickyroles décoller', interaction.user);
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    };

                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Rôle décollé")
                        .setDescription(`Le rôle <@&${role.id}> a été décollé à <@${member.id}>`)
                        .setColor(role.hexColor)
                    ] }).catch(() => {});
                    functions.log(interaction.guild, package.embeds.logs(interaction.guild)
                        .setTitle("Rôle collé")
                        .setDescription(`Un rôle a été décollé à un membre`)
                        .setFields(
                            {
                                name: "Modérateur",
                                value: `<@${interaction.user.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`,
                                inline: true
                            },
                            {
                                name: "Membre",
                                value: `<@${member.id}> ( ${member.user.tag} \`${member.id}\` )`,
                                inline: true
                            },
                            {
                                name: "Rôle",
                                value: `<@&${role.id}> ( @${role.name} \`${role.id}\` )`,
                                inline: true
                            },
                            {
                                name: 'Date',
                                value: `<t:${(Date.now() / 1000).toFixed(0)}:F> ( <t:${(Date.now() / 1000).toFixed(0)}:R> )`,
                                inline: false
                            }
                        )
                        .setColor(role.hexColor)
                    )
                })
            };
            if (subcommand == 'liste') {
                if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Pas de rôles collants")
                    .setDescription(`<@${member.id}> n'a pas de rôles collants`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôles collants")
                    .setDescription(`Voici la liste des rôles collants de <@${member.id}> (${req.length.toLocaleString('fr-DE')})\n\n${req.map(x => `<@&${x.role_id}>`).join(' ')}`)
                    .setColor(member.displayHexColor)
                ] }).catch(() => {});
            };
        });
    }
}