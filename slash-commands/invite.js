module.exports = {
    configs: {
        name: "invite",
        description: "Envoie le lien d'invitation du bot"
    },
    run: (interaction) => {
        const link = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&scope=bot%20applications.commands&permissions=8`;
        const support = `https://discord.gg/G7QDcNkvPS`;

        interaction.reply({ content: `Invitez-moi avec ce lien :\n<${link}>\n\nRejoignez le support avec ce lien\n${support}` })
    }
}