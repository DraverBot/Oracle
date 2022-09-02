const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'avis',
        description: "Envoie votre avis sur le bot"
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
        const modal = new Discord.Modal()
            .setTitle("Avis")
            .setCustomId('feedback-modal')
            .setComponents(
                new Discord.MessageActionRow()
                    .setComponents(
                        new Discord.TextInputComponent()
                            .setCustomId('feedback-value')
                            .setLabel('Votre avis')
                            .setRequired(true)
                            .setPlaceholder("Super bot avec plein de fonctionnalités 🤩")
                            .setMinLength(50)
                            .setMaxLength(2000)
                            .setStyle('PARAGRAPH')
                    )
            )
        
        interaction.showModal(modal).catch(() => {});
    }
}