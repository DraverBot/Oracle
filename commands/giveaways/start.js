const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const ms = require('ms');
const moment = require('moment');
moment.locale('fr');

module.exports.help = {
    name: "gstart",
    description: "Démarre un giveaway",
    aliases: ['giveaway-start'],
    permissions: ['manage_guild'],
    private: false,
    dm: false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    if (args.length === 0) return message.channel.send({ embeds: [ package.embeds.invalidTime(message.author) ] });

    const time = ms(args[0]);
    const winnerCount = parseInt(args[1]);
    const reward = args.slice(2).join(' ');

    if (!time || moment(time).toString().toLowerCase() === 'invalid date') return message.channel.send({ embeds: [ package.embeds.invalidTime(message.author) ] });
    if (isNaN(winnerCount)) return message.channel.send({ embeds: [ package.embeds.invalidNumber(message.author) ] });
    if (!reward) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Pas de récompense")
        .setDescription(`Oops, vous n'avez pas saisi de récompense pour le giveaway`)
        .setColor('#ff0000')
    ] });
    if (reward.includes('"')) return message.channel.send({ embeds: [ package.embeds.guillement(message.author) ] });

    client.GiveawayManager.start(message.guild, message.channel, message.author, reward, winnerCount, time);
    message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Giveaway lancé")
        .setDescription(`Je lance un giveaway avec récompense \`${reward}\``)
        .setColor('GREEN')
    ] });
};