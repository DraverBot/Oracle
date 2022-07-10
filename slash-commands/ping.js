const Discord = require('discord.js');

module.exports = {
    configs: {
        name: 'ping',
        description: "Pong",
        options: [
            {
                name: 'discret',
                description: "Fait en sorte que vous seul voyez ce message.",
                type: 'BOOLEAN',
                required: false,
                autocomplete: false
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const ephemeral = interaction.options.get('discret') ? interaction.options.get('discret').value : false;
        
        interaction.reply({ content: 'Pong :ping_pong: !', ephemeral: ephemeral });
        interaction.fetchReply().then((x) => {
            const ping =  x.createdTimestamp - interaction.createdTimestamp;

            interaction.editReply({ content: 'Pong :ping_pong: !\n\n' + `${ping} millisecondes`, ephemeral: ephemeral });
        });
    }
}