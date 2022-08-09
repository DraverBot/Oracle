const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const save = require('../../assets/scripts/htmlSave');

module.exports.help = {
    name: 'test',
    description: "Test",
    private: true,
    aliases: ['tset'],
    permissions: [],
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = async(message, args, client, prefix) => {
    client.TicketsManager.createPanel({ guild: message.guild, channel: message.channel, subject: 'test', user: message.author });
};