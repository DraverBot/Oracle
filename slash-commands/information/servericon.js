const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        permissions: [],
        systems: []
    },
    configs: {
        name: 'servericon',
        description: "Affiche l'icône du serveur"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild.icon) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Pas d'icône")
            .setDescription(`${interaction.guild.name} n'a pas d'icône`)
            .setColor('#ff0000')
        ] }).catch(() => {});

        interaction.reply({ content: interaction.guild.iconURL({ dynamic: true, size: 4096 }) }).catch(() => {});
    }
}