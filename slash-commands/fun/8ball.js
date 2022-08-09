const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: "8ball",
        description: "Demande quelque chose à la boule de crystal",
        options: [
            {
                name: "question",
                description: "Question à poser à la boule de crystal",
                type: "STRING",
                required: true
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
    run: (interaction) => {
        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Commande périmée")
            .setDescription(`Cette commande n'est plus utilisable.\nUtilisez \`/game 8ball question: ${interaction.options.getString('question')}\``)
            .setColor('#ff0000')
        ] }).catch(() => {});
    }
}