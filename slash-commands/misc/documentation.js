module.exports = {
    configs: {
        name: 'documentation',
        description: "Envoie le lien de la documentation"
    },
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    run: (interaction) => {
        interaction.reply({ content: `Liens vers la documentation du bot : <${require('../../assets/data/data.json').doc}>` }).catch(() => {});
    }
}