const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const vigenere = require('../../assets/scripts/vigenereCode');

new vigenere('', 't', '')

module.exports = {
    help: {
        cd: 5,
        dm: true,
        permissions: [],
        systems: [],
        dev: false
    },
    configs: {
        name: 'cryptage',
        description: "Crypte ou décrypte un texte selon votre clé",
        options: [
            {
                name: "action",
                description: "Action à effectuer sur votre texte",
                required: true,
                type: 'STRING',
                choices: [
                    {
                        name: 'Chiffrer',
                        value: 'code'
                    },
                    {
                        name: "Déchiffrer",
                        value: 'decode'
                    }
                ]
            },
            {
                name: 'texte',
                type: 'STRING',
                required: true,
                description: "Texte à examiner"
            },
            {
                name: "clé",
                required: true,
                description: "Clé de chiffrage/déchiffrage",
                type: 'STRING'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let action = interaction.options.getString('action');
        let text = interaction.options.getString('texte');
        let key = interaction.options.getString('clé');

        const result = new vigenere(text, key, action).run();

        interaction.reply({ content: `\`\`\`${result}\`\`\``, ephemeral: true }).catch(() => {});
    }
}