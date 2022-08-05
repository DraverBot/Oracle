const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const blagueAPI = require('blagues-api');

const blagues = new blagueAPI(package.configs['blagues-api-token']);

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
        options: Object.keys(blagues.categories).map((x) => ({name: x.toLowerCase(), description: `Blague de type ${x.toLowerCase()}`, type: 'SUB_COMMAND'}))
    },
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    run: async(interaction) => {
        const type = interaction.options.getSubcommand().toUpperCase();
        const blague = await blagues.randomCategorized(blagues.categories[type]);
    
        const embed = package.embeds.classic(interaction.user)
            .setTitle(`Blague ${type.toLowerCase()}`)
            .setDescription(`${blague.joke}\n\n||${blague.answer}||`)
            .setColor("ORANGE")
            .setAuthor({ name: `Service blagues-api`, iconURL: interaction.client.user.displayAvatarURL() });
        
        interaction.reply({ embeds: [ embed ] });
    }
}