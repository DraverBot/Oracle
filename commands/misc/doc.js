const functions = require('../../assets/functions');

module.exports = {
    help: {
        name: 'documentation',
        aliases: ['doc'],
        description: "Affiche la documentation du bot",
        permissions:[],
        dm: true,
        private: false,
        cooldown: 5
    },
    run: (message) => {
        functions.reply(message, `Le lien de la documentation est ici : <${functions.package().configs.doc}>`);
    }
}