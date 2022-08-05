const { link } = require('../../assets/data/data.json');

module.exports = {
    configs: {
        name: "invite",
        description: "Envoie le lien d'invitation du bot"
    },
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    run: (interaction) => {
        interaction.reply({ content: `Invitez-moi avec ce lien :\n<${link}>` })
    }
}