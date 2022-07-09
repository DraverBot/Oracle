const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'rank',
        description: "Affiche les informations de niveau d'un utilisateur",
        options: [
            {
                name: 'utilisateur',
                description: "Utilisateur concerné",
                required: false,
                autocomplete: false,
                type: 'USER'
            },
            {
                name: 'discret',
                description: "Fait en sorte que seul vous voie ce message.",
                required: false,
                autocomplete: false,
                type: 'BOOLEAN'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Cette commande ne peut pas s'utiliser en messages privés." });

        const user = interaction.options.get('utilisateur') ? interaction.options.get('utilisateur').user : interaction.user;
        const ephemeral = interaction.options.get('discret') ? interaction.options.get('discret').value : false;

        interaction.client.db.query(`SELECT * FROM configs WHERE guild_id="${interaction.guild.id}"`, (error, request) => {
            if (error) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ], ephemeral: ephemeral });

            if (request.length === 0 || request[0].level_enable === 0) return interaction.reply({ content: "Le système de niveau n'est pas activé sur ce serveur", ephemeral: ephemeral });
            interaction.client.db.query(`SELECT * FROM levels WHERE guild_id="${interaction.guild.id}" AND user_id="${user.id}"`, (e, r) => {
                if (e) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ], ephemeral: ephemeral });

                if (r.length === 0) return interaction.reply({ content: `Cet utilisateur n'a envoyé aucun message`, ephemeral: ephemeral });

                const embed = package.embeds.classic(interaction.user)
                    .setTitle("rank")
                    .addFields(
                        {
                            name: "Niveau",
                            value: `Niveau **${r[0].level}**`,
                            inline: false
                        },
                        {
                            name: "Messages",
                            value: `Messages totaux : ${r[0].total}`,
                            inline: false
                        },
                        {
                            name: 'Messages restants',
                            value: `**${parseInt(r[0].objectif) - parseInt(r[0].messages)} messages** restants avant de passer au niveau supérieur`,
                            inline: false
                        }
                    )
                    .setColor('ORANGE')

                interaction.reply({ embeds: [ embed ], ephemeral: ephemeral });
            });
        })
    }
}