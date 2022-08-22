const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ActionRow } = require('discord.js');

module.exports = {
    participate: () => {
        const button = new ButtonBuilder()
            .setCustomId('gw-participate')
            .setStyle(ButtonStyle.Success)
            .setLabel("Participer")
            .setEmoji('🎉')

        return button;
    },
    cancelParticipation: () => {
        const button = new ButtonBuilder()
            .setCustomId('gw-unparticipate')
            .setLabel("Annuler la participation")
            .setStyle(ButtonStyle.Danger)
        
        return button
    },
    /**
     * @param {ActionRow[]} components 
     */
    getAsRow: (components) => {
        const row = new ActionRowBuilder()
            .addComponents(components)
        
        return row;
    }
}