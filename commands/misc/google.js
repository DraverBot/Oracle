const Discord = require('discord.js');
const functions = require('../../assets/functions.js');
const package = functions.package();

module.exports.help = {
    name: 'google',
    description: "Effectue une recherche google",
    permissions: [],
    aliases: ['googlesearch'],
    cooldown: 5,
    private: false,
    dm: true
};

/**
 * @param {Discord.Message} message 
 */
module.exports.run = (message, args) => {
    if (args.length < 1) return message.channel.send({ embeds: [ package.embeds.invalidArg(message.author) ] });
    const search = `https://www.google.fr/search?q=${args.join('+')}`;

    functions.lineReply(message.id, message.channel, `Voici votre recherche : <${search}>`);
}