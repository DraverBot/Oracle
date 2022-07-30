const Discord = require('discord.js');
const functions = require('../assets/functions');
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
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const subcommand = interaction.options.getSubcommand();

        const tickets = interaction.client.ticketsManager;
        const checkIfTicket = (needTicket) => {
            if (tickets.ticketExist(interaction.channel.id) == false) {
                if (needTicket == true) {
                    interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Ticket inexistant")
                        .setDescription(`Ce salon n'est pas un ticket.\nCette commande n'est exécutable que dans un ticket.`)
                        .setColor('#ff0000')
                    ] })
                    return false;
                };
            };
        };

        if (subcommand == 'ticket') {
            let sujet = interaction.options.getString('sujet');
            tickets.create({ guild: interaction.guild, user: interaction.user, sujet });

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Ticket crée")
                .setDescription(`Je crée votre ticket`)
                .setColor('ORANGE')
            ], ephemeral: true });
        };
        if (subcommand == 'panel') {
            let sujet = interaction.options.getString('sujet');
            let channel = interaction.options.getChannel('salon');

            if (channel.type !== 'GUILD_TEXT') return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Salon invalide")
                .setDescription(`Le salon que vous avez spécifié est invalide.\nMerci de préciser un salon de type **texte**`)
                .setColor('#ff0000')
            ] });

            tickets.createPanel({ sujet, channel });

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Panel crée")
                .setDescription(`Le panel a été crée dans <#${channel.id}>`)
                .setColor(interaction.guild.me.displayHexColor)
            ] })
        }
    }
}