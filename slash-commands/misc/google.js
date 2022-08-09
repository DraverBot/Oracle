const { CommandInteraction } = require('discord.js');

module.exports = {
    configs: {
        name: 'google',
        description: "Fait une recherche google",
        options: [
            {
                name: 'recherche',
                required: true,
                autocomplete: false,
                description: "Le texte que vous souhaitez rechercher.",
                type: 'STRING'
            },
            {
                name: 'discret',
                description: "Fait en sorte que seul vous voie ce message",
                autocomplete: false,
                required: false,
                type: 'BOOLEAN'
            }
        ]
    },
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    /**
     * @param {CommandInteraction} interaction 
     */
    run: (interaction) => {
        const data = interaction.options.get('recherche').value;
        
        const search = `https://www.google.fr/search?q=${data.replace(/ +/g, '+')}`;

        const ephemeral = interaction.options.get('discret') ? interaction.options.get('discret').value : false;
        interaction.reply({ content: `Voici votre recherche : <${search}>`, ephemeral: ephemeral });
    }
}