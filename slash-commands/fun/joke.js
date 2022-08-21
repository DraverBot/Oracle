const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const blagueAPI = require('blagues-api');

const blagues = new blagueAPI(package.configs['blagues-api-token']);
const values = {
    global: 'général',
    dev: "développeur",
    dark: "noir",
    limit: "limite",
    beauf: 'beauf',
    blondes: 'blondes'
};

module.exports = {
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    configs: {
        name: 'blague',
        description: "Affiche une blague aléatoire",
        options: [
            {
                name: 'type',
                description: "Type de la blague",
                required: true,
                type: 'STRING',
                choices: Object.keys(values).map(x => ({ name: x, value: values[x] }))
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    run: async(interaction) => {
        const type = interaction.options.getString('type');
        const blague = await blagues.randomCategorized(blagues.categories[type]);
    
        const embed = package.embeds.classic(interaction.user)
            .setTitle(`Blague ${type.toLowerCase()}`)
            .setDescription(`${blague.joke}\n\n||${blague.answer}||`)
            .setColor("ORANGE")
            .setAuthor({ name: `Service blagues-api`, iconURL: interaction.client.user.displayAvatarURL() });
        
        interaction.reply({ embeds: [ embed ] });
    }
}