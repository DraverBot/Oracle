const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'ticket',
        description: "Interagissez avec le système de tickets",
        options: [
            {
                name: 'create',
                description: "Créer un ticket",
                type: 'SUB_COMMAND_GROUP',
                options: [
                    {
                        name: 'panel',
                        description: "Créer un panel de ticket",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'sujet',
                                description: "Sujet du panel de ticket",
                                type: 'STRING',
                                required: true
                            },
                            {
                                name: 'salon',
                                description: "Salon du panel de ticket",
                                required: true,
                                type: 'CHANNEL'
                            },
                            {
                                name: 'description',
                                description: "Description du ticket, son objectif.",
                                required: true,
                                type: 'STRING'
                            },
                            {
                                name: 'image',
                                description: "Image affichée sur l'embe du ticket",
                                required: false,
                                type: 'STRING'
                            }
                        ]
                    },
                    {
                        name: 'ticket',
                        description: "Créer un ticket",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'sujet',
                                description: "Sujet du ticket",
                                required: true,
                                type: 'STRING'
                            }
                        ]
                    }
                ]
            },
            {
                name: 'rename',
                description: "Renomme le ticket",
                type:'SUB_COMMAND',
                options: [
                    {
                        name: 'nom',
                        description: "Nouveau nom du ticket",
                        required: true,
                        type: 'STRING'
                    }
                ]
            },
            {
                name: 'save',
                description: "Sauvegarde le ticket",
                type: 'SUB_COMMAND'
            },
            {
                name: 'add',
                description: "Ajoute un utilisateur au ticket",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'utilisateur',
                        description: "Utilisateur à ajouter au ticket",
                        type: 'USER',
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Retire un utilisateur du ticket',
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'utilisateur',
                        description: "Utilisateur à retirer du ticket",
                        required: true,
                        type: 'USER'
                    }
                ]
            },
            {
                name: 'close',
                description: "Ferme le ticket",
                type: 'SUB_COMMAND'
            },
            {
                name: 'delete',
                description: "Supprime le ticket",
                type: 'SUB_COMMAND'
            },
            {
                name: 'reopen',
                description: "Réouvre le ticket",
                type: 'SUB_COMMAND'
            },
            {
                name: 'modrole',
                description: "Gère les rôles de modérateurs de tickets",
                type: 'SUB_COMMAND_GROUP',
                options: [
                    {
                        name: 'ajouter',
                        type: 'SUB_COMMAND',
                        description: "Ajoute un rôle de modérateur de tickets",
                        options: [
                            {
                                name: "rôle",
                                type: 'ROLE',
                                description: "Rôle à ajouter",
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'retirer',
                        type: 'SUB_COMMAND',
                        description: "Retirer un rôle de modérateur de tickets",
                        options: [
                            {
                                name: "rôle",
                                type: 'ROLE',
                                description: "Rôle à retirer",
                                required: true
                            }
                        ]
                    },
                    {
                        name: "liste",
                        description: "Affiche la liste des rôles de modérateurs de tickets",
                        type: 'SUB_COMMAND'
                    }
                ]
            }
        ]
    },
    help: {
        dm: false,
        dev: false,
        permissions: [],
        systems: [{name: "de tickets", value: "ticket_enable", state: true}],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        const subcommand = interaction.options.getSubcommand();

        const tickets = interaction.client.TicketsManager;
        const checkIfTicket = (needTicket) => {
            if (!tickets.isTicket(interaction.channel.id)) {
                if (needTicket == true) {
                    interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Ticket inexistant")
                        .setDescription(`Ce salon n'est pas un ticket.\nCette commande n'est exécutable que dans un ticket.`)
                        .setColor('#ff0000')
                    ] })
                    return false;
                };
                return true;
            };
            return true;
        };

        if (['ajouter', 'liste', 'retirer'].includes(subcommand)) {
            await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] }).catch(() => {});
            interaction.client.db.query(`SELECT ticket_roles FROM configs WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                if (err) {
                    functions.sendError(err, 'query fetch at /ticket modrole', interaction.user);
                    interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    return;
                };
                if (req.length > 0) req[0].ticket_roles = JSON.parse(req[0].ticket_roles);
                // console.log(req[0]);
    
                if (subcommand == 'liste') {
                    if (req[0].ticket_roles.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Aucun rôle automatique")
                        .setDescription(`Aucun rôle de modérateur de tickets n'a été configuré`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});
    
                    const embed = package.embeds.classic(interaction.user)
                        .setTitle("Rôles de modérateurs de tickets")
                        .setDescription(`Les rôles configurés sur ${interaction.guild.name} en tant que modérateurs de tickets ${req[0].ticket_roles.length > 1 ? 'sont':'est'} :\n${req[0].ticket_roles.map(r => `<@&${r}>`).join(' ')}`)
                        .setColor(interaction.member.displayHexColor)
                    
                    interaction.editReply({ embeds: [ embed ] }).catch(() => {});
                };
                if (subcommand == 'ajouter') {
                    let role = interaction.options.getRole('rôle');
                    if (role.position >= interaction.member.roles.highest.position) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("🚫 Rôle trop haut")
                        .setDescription(`Ce rôle est **supérieur** ou **égal** à vous dans la hiérarchie des rôles`)
                        .setColor(role.hexColor)
                    ] }).catch(() => {});
    
                    if (req[0].ticket_roles.includes(role.id)) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Rôle déjà configuré")
                        .setDescription(`Le rôle <@&${role.id}> est déjà configuré sur ${interaction.guild.name}`)
                        .setColor(role.hexColor)
                    ] }).catch(() => {});

                    req[0].ticket_roles.push(role.id)
    
                    interaction.client.db.query(`UPDATE configs SET ticket_roles='${JSON.stringify(req[0].ticket_roles)}' WHERE guild_id="${interaction.guild.id}"`, (er) => {
                        if (er) {
                            functions.sendError(er, 'query add at /autorole ajouter', interaction.user);
                            interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                            return;
                        };
    
                        interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                            .setTitle("Rôle configuré")
                            .setDescription(`Le rôle <@&${role.id}> est maintenant un rôle de modérateurs de tickets`)
                            .setColor(role.hexColor)
                        ] }).catch(() => {});
                        interaction.client.TicketsManager.loadCache();
                    });
                };
                if (subcommand == 'retirer') {
                    let role = interaction.options.getRole('rôle');
                    if (role.position >= interaction.member.roles.highest.position) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("🚫 Rôle trop haut")
                        .setDescription(`Ce rôle est **supérieur** ou **égal** à vous dans la hiérarchie des rôles`)
                        .setColor(role.hexColor)
                    ] }).catch(() => {});
    
                    if (!req[0].ticket_roles.includes(role.id)) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Rôle non configuré")
                        .setDescription(`Le rôle <@&${role.id}> n'est pas configuré sur ${interaction.guild.name}`)
                        .setColor(role.hexColor)
                    ] }).catch(() => {});

                    let index = req[0].ticket_roles.indexOf(role.id);
                    req[0].ticket_roles.splice(index, 1);

                    interaction.client.db.query(`UPDATE configs SET ticket_roles='${JSON.stringify(req[0].ticket_roles)}' WHERE guild_id="${interaction.guild.id}"`, (er) => {
                        if (er) {
                            functions.sendError(er, 'query remove at /ticket modrole retirer', interaction.user);
                            interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                            return;
                        };
    
                        interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                            .setTitle("Rôle configuré")
                            .setDescription(`Le rôle <@&${role.id}> n'est maintenant plus un rôle de modérateur de tickets`)
                            .setColor(role.hexColor)
                        ] }).catch(() => {});
                        interaction.client.TicketsManager.loadCache();
                    });
                };
            });
        }
        if (subcommand == 'ticket') {
            let sujet = interaction.options.getString('sujet');
            tickets.createTicket({ guild: interaction.guild, user: interaction.user, sujet });
            
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Ticket crée")
                .setDescription(`Je crée votre ticket`)
                .setColor('ORANGE')
            ], ephemeral: true });
        };
        if (subcommand == 'panel') {
            if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, 'gérer le serveur') ] }).catch(() => {});

            let sujet = interaction.options.getString('sujet');
            let channel = interaction.options.getChannel('salon');
            let description = interaction.options.getString('description').replace('\\n', '\n');
            let image = interaction.options.getString('image');

            if (image) {
                const validation = /(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/;
                
                if (!validation.test(image)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Image invalide")
                    .setDescription(`Hola ? D'après mes agents de vérification, votre image est invalide.\nSi ce n'est pas le cas, contactez mes développeurs`)
                    .setColor('#ff0000')
                ] });
            }

            if (channel.type !== 'GUILD_TEXT') return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Salon invalide")
                .setDescription(`Le salon que vous avez spécifié est invalide.\nMerci de préciser un salon de type **texte**`)
                .setColor('#ff0000')
            ] });

            tickets.createPanel({ guild: interaction.guild, channel: channel, subject: sujet, user: interaction.user, description: description, image: image });

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Panel crée")
                .setDescription(`Le panel a été crée dans <#${channel.id}>`)
                .setColor(interaction.guild.me.displayHexColor)
            ] })
        };
        if (subcommand == 'close') {
            if (!checkIfTicket(true)) return;

            tickets.closeTicket({ channel: interaction.channel });
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Ticket fermé")
                .setDescription(`<@${interaction.user.id}> a fermé son ticket`)
                .setColor(interaction.guild.me.displayHexColor)
            ] }).catch(() => {});
        };
        if (subcommand == 'delete') {
            if (!checkIfTicket(true)) return;

            await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Suppression")
                .setDescription(`Le ticket sera supprimé <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>`)
                .setColor(interaction.guild.me.displayHexColor)
            ], components: [ new Discord.MessageActionRow().addComponents(new Discord.MessageButton({ label: 'Annuler', style: 'DANGER', customId: 'cancel' })) ] }).catch((e) => {console.log(e)});
            
            const msg = await interaction.fetchReply();

            const collector = msg.createMessageComponentCollector({ filter: i => i.customId == 'cancel', max: 1, time: 10000 });
            collector.on('end', (collected) => {
                if (collected.size == 0) {
                    tickets.delete({ channel: interaction.channel });
                } else {
                    msg.edit({ embeds: [ package.embeds.cancel() ], components: [] }).catch(() => {});
                };
            });
        };
        if (subcommand == 'reopen') {
            if (!checkIfTicket(true)) return;

            tickets.reopenTicket({ channel: interaction.channel });
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle('Ticket réouvert')
                .setDescription(`<@${interaction.user.id}> a réouvert le ticket`)
                .setColor(interaction.guild.me.displayHexColor)
            ] }).catch(() => {});
        };
        if (subcommand == 'save') {
            if (!checkIfTicket(true)) return;

            const customId = await tickets.saveTicket({ channel: interaction.channel });
            
            const attachment = new Discord.MessageAttachment()
                .setFile(customId)
                .setName(`${interaction.channel.name}-ticket-save.html`)
                .setDescription(`Sauvegarde du ticket`)
                .setSpoiler(false)
                                    
            interaction.reply({ files: [ attachment ], embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Sauvegarde")
                .setDescription(`Le ticket a été sauvegardé`)
                .setColor(interaction.guild.me.displayHexColor)
            ] }).catch((e) => {console.log(e)});
        };
        if (subcommand == 'add') {
            if (!checkIfTicket(true)) return;

            let member = interaction.options.getMember('utilisateur');

            interaction.channel.permissionOverwrites.edit(member, { VIEW_CHANNEL: true, SEND_MESSAGES: true, ATTACH_FILES: true, ADD_REACTIONS: true }).catch(() => {});
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Utilisateur ajouté")
                .setDescription(`<@${member.id}> a été ajouté au ticket`)
                .setColor('#00ff00')
            ] }).catch(() => {});
        };
        if (subcommand == 'remove') {
            if (!checkIfTicket(true)) return;

            let member = interaction.options.getMember('utilisateur');

            interaction.channel.permissionOverwrites.edit(member, { VIEW_CHANNEL: false }).catch(() => {});
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Utilisateur retiré")
                .setDescription(`<@${member.id}> a été retiré du ticket`)
                .setColor('#ff0000')
            ] }).catch(() => {});
        };
        if (subcommand == 'rename') {
            if (!checkIfTicket(true)) return;
            let name = interaction.options.getString('nom');

            tickets.ticketRename({ channel: interaction.channel, name: name });
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Ticket renommé")
                .setDescription(`Le ticket a été renommé en ${name}`)
                .setColor(interaction.guild.me.displayHexColor)
            ] }).catch(() => {});
        };
    }
};