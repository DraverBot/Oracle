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
                            },
                            {
                                name: 'annonces',
                                value: 'GUILD_NEWS'
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
                        required: true,
                        autocomplete: false,
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
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'créer') {
            const name = interaction.options.get('Nom').value;
            const type = interaction.options.get('Type').value;

            let parent = null;
            
            if (interaction.options.get('catégorie')) {
                parent = interaction.options.get('categorie').channel;
                if (channel.type !== 'GUILD_CATEGORY') return interaction.reply({ content: "Merci de saisir une catégorie en paramètre `catégorie`", ephemeral: true });

                if (type === 'GUILD_CATEGORY') return interaction.reply({ content: "Vous ne pouvez pas mettre une catégorie dans une catégorie.", ephemeral: true });
            };
            interaction.guild.channels.create(name, {
                type: type
            }).then((channel) => {
                if (parent !== null) {
                    channel.setParent(parent);
                };

                interaction.channel.reply({ content: `Salon crée : <#${channel.id}>`, ephemeral: true });
                channel.send({ content: `Salon crée par <@${interaction.author.id}>` });
            });
        } else {
            const channel = interaction.options.get('salon').channel;

            const button = (label, id, style, emoji) => {
                const a = new Discord.MessageButton()
                    .setLabel(label)
                    .setCustomId(id)
                    .setStyle(style)

                if (emoji !== null || emoji !== undefined) a.setEmoji(emoji);

                return a
            };

            const row = new Discord.MessageActionRow()
                .addComponents(
                    button('Confirmer', 'confirm', "DANGER"),
                    button('Annuler', "cancel","SUCCESS")
                );

            interaction.reply({ content: `Êtes-vous sûr de vouloir supprimer <#${channel.id}>`, components: [ row ] });
            interaction.fetchReply().then((reply) => {
                const collector = reply.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 120000, max: 1 });
                
                collector.on('end', (collecteds, reason) => {
                    const collected = collecteds.first();
                    if (!collected || collected.customId === 'cancel') {
                        return reply.edit({ content: `J'annule la suppression du salon.`, components: [] }).catch(() => {});
                    } else {
                        reply.edit({ content: `Je supprime ${channel.name}`, components: [] }).catch(() => {});
                        channel.delete().catch(() => {});
                    };
                });
            });
        };
    }
};