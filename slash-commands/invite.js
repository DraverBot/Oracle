module.exports = {
    configs: {
        name: "invite",
        description: "Envoie le lien d'invitation du bot"
    },
    run: (interaction) => {
        const link = `https://bit.ly/3NUdTvE`;
        interaction.reply({ content: `Invitez-moi avec ce lien :\n<${link}>` })
    }
}