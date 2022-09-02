const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'interactionCreate',
    /**
     * @param {Discord.ModalSubmitInteraction} interaction 
     */
    execute: (interaction) => {
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'feedback-modal') {
                const value = interaction.fields.getTextInputValue('feedback-value');

                interaction.client.channels.cache.get('946079273335279676').send({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Avis")
                    .setDescription(value)
                    .setColor('ORANGE')
                ] }).catch(() => {});

                interaction.reply({ content: "Merci d'avoir donné votre avis sur Oracle", ephemeral: true }).catch(() => {});
            }
        }
    }
}