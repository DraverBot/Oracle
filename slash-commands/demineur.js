const functions = require('../assets/functions');
const package = functions.package();
const { CommandInteraction } = require('discord.js');

module.exports = {
    configs: {
        name: 'demineur',
        description: "Lance une partie de démineur",
        options: [
            {
                name: 'discret',
                description: "Fait en sorte que seul vous coie ce message",
                required: false,
                autocomplete: false,
                type: 'BOOLEAN'
            }
        ]
    },
    /**
     * @param {CommandInteraction} interaction 
     */
    run: (interaction) => {
        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Commande inutilisable")
            .setDescription(`La commande \`/demineur\` a été remplacée par la commande \`/game démineur\``)
            .setColor('ORANGE')
        ], ephemeral: true });
    }
}