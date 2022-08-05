const tickets = require('../../assets/tickets');
const embeds = require('../../assets/embeds');
const Discord = require('discord.js');

module.exports = {
    configs: {
        name: 'ticket-create',
        description: "Crée un ticket"
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
        return interaction.reply({ embeds: [ embeds.classic(interaction.user)
            .setTitle("Commande inutilisable")
            .setDescription(`Cette commande n'est plus utilisable.\nUtilisez \`/ticket create\` à la place.`)
            .setColor('#ff0000')
        ], ephemeral: true })
    }
}