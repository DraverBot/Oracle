module.exports = {
    configs: {
        name: "support",
        description: "Envoie le serveur support"
    },
    run: (interaction) => {
        const link = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot%20applications.commands&permissions=8`;
        const { support } = require('../assets/data/data.json');

        interaction.reply({ content: `Rejoignez le support avec ce lien:\n${support}` })
    }
}