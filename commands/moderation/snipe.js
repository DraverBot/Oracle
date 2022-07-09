const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: "snipe",
    description: "Affiche le dernier message supprimé dans le salon, et plus si un nombre est spécifié.",
    aliases: [],
    permissions: ['manage_messages'],
    dm: false,
    private: false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    const index = parseInt(args[0] || 1);
    const number = index-1;

    if (!message.channel.snipes || !message.channel.snipes.get(number)) return functions.reply(message, package.embeds.classic(message.author)
    .setTitle("Rien")
    .setDescription(`Je ne vois rien à sniper dans ce salon...`)
    .setColor('ORANGE'));
    const snipeData = message.channel.snipes.get(number);
    
    const snipe = new Discord.MessageEmbed()
        .setTitle("Snipe")
        .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL({ dynamic: false }) })
        .setTimestamp(new Date(parseInt(snipeData.createdTimestamp)).toISOString())
        .setFooter({ text: snipeData.author.username, iconURL: snipeData.author.avatarURL({ dynamic: true }) })
        .setDescription(`Voici le contenu du message : \`\`\`${snipeData.content}\`\`\``)
        .setColor(snipeData.member.roles.highest.hexColor)

    functions.reply(message, snipe);
}