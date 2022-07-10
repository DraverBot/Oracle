module.exports = {
    configs: {
        name: "invite",
        description: "Envoie le lien d'invitation du bot"
    },
    run: (interaction) => {
        const link = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot%20applications.commands&permissions=8`;
        const { support } = require('../assets/data/data.json');

        interaction.reply({ content: `Invitez-moi avec ce lien:\n<${link}>` })
    }
}