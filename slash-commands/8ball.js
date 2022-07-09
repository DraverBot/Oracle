const Discord = require('discord.js');
const functions = require('../assets/functions');
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
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const responses = [
            "Je ne sais pas",
            "Demandez plus tard",
            "Il est trop tôt pour le dire",
            "Vous connaissez la réponse",
            "Ma boule de crystal est floue",
            "Les éléments ne permettent pas une lecture facile",
            "Seul pile ou face le décidera",
            "Je ne peux pas le prédire maintenant"
        ];
        const response = responses[Math.floor(Math.random() * 8)];
        const embed = package.embeds.classic(interaction.user)
            .setTitle(":8ball: Boule de crystal")
            .setColor(interaction.guild ? interaction.guild.me.displayHexColor : 'ORANGE')
            .setDescription(`${interaction.options.get('question').value}
            
:8ball: **${response}**`)

        interaction.reply({ embeds: [ embed ], ephemeral: interaction.options.get('discret') ? interaction.options.get('discret').value : false });
    }
}