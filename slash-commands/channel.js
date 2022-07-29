const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'salon',
        description: "Gère les salons",
        options: [
            {
                name: 'créer',
                type: 'SUB_COMMAND',
                description: "Créer un salon",
                options: [
                    {
                        name: 'nom',
                        description: "Nom du salon",
                        type: 'STRING',
                        required: true,
                        autocomplete: false
                    },
                    {
                        name: 'type',
                        description: "Type du salon",
                        type: 'STRING',
                        required: true,
                        autocomplete: false,
                        choices: [
                            {
                                name: 'texte',
                                value: "GUILD_TEXT"
                            },
                            {
                                name: 'vocal',
                                value: 'GUILD_VOICE'
                            },
                            {
                                name: 'catégorie',
                                value: 'GUILD_CATEGORY'
                            }
                        ]
                    },
                    {
                        name: 'catégorie',
                        type: 'CHANNEL',
                        required: false,
                        autocomplete: false,
                        description: "Catégorie dans laquelle le salon sera crée"
                    }
                ]
            },
            {
                name: 'supprimer',
                type: 'SUB_COMMAND',
                description: "Supprimer un salon",
                options: [
                    {
                        name: 'salon',
                        description: "Le salon à supprimer",
                        required: false,
                        type: 'CHANNEL'
                    }
                ]
            },
            {
                name: 'renommer',
                type: 'SUB_COMMAND',
                description: "Renommer un salon",
                options: [
                    {
                        name: 'nom',
                        description: "Nouveau nom du salon",
                        required: true,
                        type: 'STRING'
                    },
                    {
                        name: 'salon',
                        description: "Salon à renommer",
                        required: false,
                        type: 'CHANNEL'
                    }
                ]
            },
            {
                name: 'déplacer',
                type: 'SUB_COMMAND',
                description: "Déplacer un salon.",
                options: [
                    {
                        name: 'places',
                        description: "Nombre de places pour déplacer le salon. Rentrez un nombre négatif ou un nombre positif.",
                        required: true,
                        type: 'NUMBER'
                    },
                    {
                        name: 'salon',
                        description: "Salon à déplacer",
                        required: false,
                        type: 'CHANNEL'
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Cette commande n'est pas disponible en messages privés", ephemeral: true }).catch(() => {});
        if (!interaction.member.permissions.has('MANAGE_CHANNELS')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, 'gérer les salons') ] }).catch(() => {});

        const subcommand = interaction.options.getSubcommand();
        if (subcommand == 'créer') {
            let name = interaction.options.getString('nom');
            let type = interaction.options.getString('type');

            if (type == 'GUILD_CATEGORY' && interaction.options.getChannel('catégorie') && interaction.options.getChannel('catégorie').type == 'GUILD_CATEGORY') return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Action impossible")
                .setDescription(`Vous ne pouvez pas créer une catégorie dans une catégorie`)
                .setColor('#ff0000')
            ], ephemeral: true }).catch(() => {});

            interaction.guild.channels.create(name, {
                type: type
            }).then((channel) => {
                if (interaction.options.getChannel('catégorie') && interaction.options.getChannel('catégorie').type == 'GUILD_CATEGORY') {
                    channel.setParent(interaction.options.getChannel('catégorie')).catch(() => {});
                }
                
                interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Salon crée")
                    .setDescription(`${package.emojis.gsyes} Le salon a été crée ( <#${channel.id}> )`)
                    .setColor('ORANGE')
                ] }).catch(() => {});

                if (type == 'GUILD_TEXT') {
                    channel.send({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Salon crée")
                        .setDescription(`Salon crée par <@${interaction.user.id}>`)
                        .setColor('ORANGE')
                    ] });
                };
            });
        };
        if (subcommand == 'supprimer') {
            let channel = interaction.options.get('salon')?.channel || interaction.channel;
            
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Supression")    
                .setDescription(`<#${channel.id}> sera supprimé <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>`)
                .setColor('ORANGE')
            ], components: [ new Discord.MessageActionRow({ components: [ new Discord.MessageButton({ label: 'Annuler', style: 'DANGER', customId: 'cancel' }) ] }) ] }).then(() => {
                interaction.fetchReply().then((reply) => {
                    const collector = reply.createMessageComponentCollector({ filter: x => x.user.id == interaction.user.id, time: 10000, max: 1 });

                    collector.on('end', (collected) => {
                        if (collected.size == 0) {
                            channel.delete().catch(() => {})
                            reply.edit({ embeds: [ package.embeds.classic(interaction.user)
                                .setTitle("Salon supprimé")
                                .setDescription(`Le salon ${channel.name} a été supprimé`)
                                .setColor('ORANGE')
                            ], components: [] });
                        } else {
                            reply.edit({ embeds: [ package.embeds.cancel() ], components: [] }).catch(() => {});
                        };
                    });
                });
            });
        };
        if (subcommand == 'renommer') {
            let nom = interaction.options.getString('nom');
            let channel = interaction.options.get('salon')?.channel ?? interaction.channel;

            let oldName = channel.name;

            channel.setName(nom);
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Salon renommé")
                .setDescription(`Le salon ${oldName} a été renommé en <#${channel.id}>`)
                .setColor('ORANGE')
            ] }).catch(() => {});
        };
        if (subcommand == 'déplacer') {
            let places = interaction.options.getNumber('places');
            let channel = interaction.options.get('salon')?.channel ?? interaction.channel;

            let position = channel.position + places;
            if (position < 1) position = 1;
            if (position > interaction.guild.channels.cache.size) position = interaction.guild.channels.cache.size;

            channel.setPosition(position);

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Salon déplacé")
                .setDescription(`Le salon <#${channel.id}> a été déplacé`)
                .setColor('ORANGE')
            ] });
        }
    }
};