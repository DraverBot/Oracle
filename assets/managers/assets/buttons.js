const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
    participate: () => {
        const button = new MessageButton()
            .setCustomId('gw-participate')
            .setStyle('SUCCESS')
            .setLabel("Participer")
            .setEmoji('🎉')

        return button;
    },
    cancelParticipation: () => {
        const button = new MessageButton()
            .setCustomId('gw-unparticipate')
            .setLabel("Annuler la participation")
            .setStyle('DANGER')
        
        return button
    },
    /**
     * @param {MessageActionRow[]} components 
     */
    getAsRow: (components) => {
        const row = new MessageActionRow()
            .addComponents(components)
        
        return row;
    }
}