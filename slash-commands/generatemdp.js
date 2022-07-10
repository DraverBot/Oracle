const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'generatemdp',
        description: "Génère un mot de passe aléatoire",
        options: [
            {
                type: 'INTEGER',
                name: 'taille',
                description: "Nombre de caractères",
                required: true
            },
            {
                type: 'BOOLEAN',
                name: "majuscules",
                description: "Le mot de passe doit-il inclure des majuscules ?",
                required: true
            },
            {
                type: 'BOOLEAN',
                name: 'nombres',
                description: "Le mot de passe contient-il des nombres ?",
                required: true
            },
            {
                type: 'BOOLEAN',
                name: "speciaux",
                description: "Le mot de passe doit-il contenir des caractères spéciaux",
                required: true
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let caracts = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        let majs = caracts.map(x => x.toUpperCase());
        let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        let special = ['&', '{', '}', '(', ')', '[', ']', '-', '_', '/', '\\', '=', '+', '-', '€', '%', '$', '!', '?', '.', ':', ';', ',', '<', '>'];

        const all = {
            "majs": majs,
            'numbers': numbers,
            'special': special
        };
        let data = {
            length: interaction.options.getInteger('taille'),
            majs: interaction.options.getBoolean('majuscules'),
            special: interaction.options.getBoolean('speciaux'),
            numbers: interaction.options.getBoolean('nombres')
        };

        const corres = {
            0: caracts,
        };

        for (let i = 1; i < 4; i++) {
            const keys = Object.keys(data);
            if (data[keys[i]]) corres[i] = all[keys[i]];
        };

        let password = '';
        for (let i = 1; i < data.length; i++) {
            let max = Object.keys(corres).length;
            let indexForArray = Math.floor(Math.random() * max);
            
            let array = corres[indexForArray];
            let caract = array[Math.floor(Math.random() * array.length)];

            password = password + caract;
        };

        interaction.reply({ content: `Voici votre mot de passe: \`${password}\``, ephemeral: true });
    }
}