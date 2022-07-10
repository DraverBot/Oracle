const Discord = require('discord.js');
const { gsyes, gsno } = require('../assets/data/emojis.json');
const { classic } = require('../assets/embeds.js');

module.exports = {
    configs: {
        name: 'suggestion',
        description: "Fait une suggestion dans le salon de la commande",
        options: [
            {
                name: 'suggestion',
                description: "Suggestion à proposer",
                type: 'STRING',
                required: true
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Cette commande n'est disponible que dans un serveur" });

        interaction.reply({ embeds: [ classic(interaction.user)
            .setTitle("Suggestion")
            .setDescription(`Nouvelle **suggestion** de <@${interaction.user.id}> :\n> ${interaction.options.getString('suggestion')}`)
            .setColor(interaction.guild.me.displayHexColor)
        ] }).then(() => {
            interaction.fetchReply().then(async(x) => {
                [ gsyes, gsno ].forEach(async(y) => await x.react(y));
            });
        });
    }
};