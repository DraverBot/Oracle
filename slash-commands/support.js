module.exports = {
    configs: {
        name: 'support',
        description: "Envoie le lien du serveur de support"
    },
    run: (interaction) => {
        interaction.reply({ content: `Soyez informé de l'état du bot directement de puis son serveur de support\n\n${require('../assets/data/data.json').support}` })
    }
}