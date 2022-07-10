const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const blagueAPI = require('blagues-api');

const blagues = new blagueAPI(package.configs['blagues-api-token']);

module.exports = {
    help: {
        name: 'blague',
        description: "Affiche une blague aléatoire",
        permissions: [],
        aliases: ['joke'],
        private: false,
        dm: false,
        cooldown: 5
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async(message, args) => {
        let type = (args.shift() || 'help').toUpperCase();

        if (!blagues.categories[type]) {
            const embed = package.embeds.classic(message.author)
                .setTitle("Type")
                .setDescription(`Merci de préciser la catégorie de votre blague dans votre commande.\nCatégories :\n${Object.keys(blagues.categories).map(x => `> \`${x.toLowerCase()}\``).join('\n')}`)
                .setColor('ORANGE')
            
            functions.reply(message, embed);
        } else {
            const blague = await blagues.randomCategorized(blagues.categories[type]);

            const embed = package.embeds.classic(message.author)
                .setTitle(`Blague ${type.toLowerCase()}`)
                .setDescription(`${blague.joke}\n\n||${blague.answer}||`)
                .setColor("ORANGE")
                .setAuthor({ name: `Service blagues-api`, iconURL: message.client.user.displayAvatarURL() });
            
            functions.reply(message, embed);
        }
    }
}