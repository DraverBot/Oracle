const Discord = require("discord.js");
const functions = require('../../assets/functions');
const package = functions.package();

let options = [];

for (let i = 0; i < 9; i++) {
    const choice = {
        name: `proposition${(i + 1).toString()}`,
        description: "Définissez la proposition " + (i + 1).toString(),
        type: "STRING",
        required: i <= 1 ? true : false
    }

    options.push(choice);
}

module.exports = {
    configs: {
        name: "choix",
        description: "Fais un choix parmis les propositions",
        options: options        
    },
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let props = [];
        for (let i = 0; i < 10; i++) {
            props.push(interaction.options.get(`proposition${i + 1}`)?.value);
        };
        props = props.filter(x => ![undefined, null].includes(x));

        let choice = props[functions.random(props.length, 0)];

        interaction.reply({ content: `Mon choix est **${choice}**` }).catch(() => {});
    }
}