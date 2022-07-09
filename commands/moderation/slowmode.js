const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const ms = require('ms');

module.exports.help = {
    name: 'slowmode',
    description: "Configure le slowmode du salon",
    permissions: ['manage_channels'],
    aliases: [],
    private: false,
    dm: false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports.run = (message, args, client, prefix) => {
    if (args.length < 1) return message.channel.send({ embeds: [ package.embeds.invalidArg(message.author) ] });
    let time = args[0];

    if (!time) return message.channel.send({ embeds: [ package.embeds.invalidTime(message.author) ] });

    message.channel.setRateLimitPerUser(time, `Slwomoded by ${message.author.id}`).catch(() => {});

    message.channel.send({ content: `Le cooldown a été mis sur **${args[0]}**` });
}