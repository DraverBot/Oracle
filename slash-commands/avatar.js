const { CommandInteraction } = require('discord.js');

module.exports = {
    configs: {
        name: 'avatar',
        description: "Affiche la photo de profil d'une personne",
        options: [
            {
                name: 'utilisateur',
                description: "Utilisateur dont vous voulez voir la photo de profil",
                type: 'USER',
                required: false,
                autocomplete: false
            }
        ]
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    run: (interaction) => {
        const user = interaction.options.get('utilisateur') ? interaction.options.get('utilisateur').user : interaction.user;

        interaction.reply({ content: `Voici la photo de profil de **${user.username}**:\n**${user.displayAvatarURL({ dynamic: true, size: 4096 })}**` });
    }
}