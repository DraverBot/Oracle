module.exports = {
    configs: {
        name: 'documentation',
        description: "Envoie le lien de la documentation"
    },
    run: (interaction) => {
        interaction.reply({ content: `Liens vers la documentation du bot : <${require('../assets/data/data.json').doc}>` }).catch(() => {});
    }
}