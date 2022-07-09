const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: '8ball',
    description: "Répond à votre question (aléatoirement)",
    aliases: [],
    permissions: [],
    cooldown: 5,
    private:false,
    dm: true
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args) => {
    if (args.length == 0) return message.channel.send({ embeds: [ package.embeds.invalidArg(message.author) ] });
    const question = args.join(' ');

    const responses = [
        "Je ne sais pas",
        "Demandez plus tard",
        "Il est trop tôt pour le dire",
        "Vous connaissez la réponse",
        "Ma boule de crystal est floue",
        "Les éléments ne permettent pas une lecture facile",
        "Seul pile ou face le décidera",
        "Je ne peux pas le prédire maintenant"
    ];
    const response = responses[Math.floor(Math.random() * 8)];
    functions.lineReply(message.id, message.channel, `:8ball: ${response}`);
}