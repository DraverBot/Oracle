const tickets = require('../assets/tickets');
const Discord = require('discord.js');

module.exports = {
    configs: {
        name: 'ticket-create',
        description: "Crée un ticket",
        options: [
            {
                name: 'sujet',
                description: "Sujet du ticket",
                type: 'STRING',
                required: true,
                autocomplete: false
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
        if (!interaction.guild) return interaction.reply({ content: "Cette commande n'est pas exécutable en messages privés." });

        const ephemeral = interaction.options.get('discret') ? interaction.options.get('discret').value : true;
        const sujet = interaction.options.get('sujet').value;

        tickets.create(interaction.guild, interaction.user, sujet);
        interaction.reply({ content: "Je crée votre ticket", ephemeral: ephemeral })
    }
}