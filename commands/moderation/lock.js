const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'lock',
    aliases: ['channellock', 'lockchannel', 'lock-channel', 'channel-lock'],
    permissions: ['manage_channels'],
    cooldown: 5,
    private: false,
    dm: false,
    description: "Vérouille un salon pour le role everyone"
};

/**
 * @param {Discord.Message} message
 * @param {Array} args
 */
module.exports.run = (message, args) => {
    let channel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first() || message.channel;

    channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SEND_MESSAGES: false
    })

    message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Salon vérouillé")
        .setColor('GREEN')
        .setDescription(`Le salon a été bloqué pour le rôle <@&${message.guild.roles.everyone.id}>`)
    ] })
}