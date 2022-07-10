const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'unlock',
    description: "Dévérouille le salon pour le rôle everyone",
    permissions: ['manage_channels'],
    aliases: [],
    cooldown: 5,
    private: false, 
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args) => {
    let channel = message.guild.channels.cache.get(args[0]) || message.mentions.channels.first() || message.channel;

    channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SEND_MESSAGES: true
    });

    message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Salon dévérouillé")
        .setDescription(`Le salon <#${channel.id}> a été dévérouillé pour le rôle <@&${message.guild.roles.everyone.id}>`)
        .setColor('GREEN')
    ] });
}