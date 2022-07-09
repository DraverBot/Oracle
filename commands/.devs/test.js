const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const morpion = require('../../assets/morpion');

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
module.exports.run = (message, args, client, prefix) => {
    client.RpgManager.start({ channel: message.channel, user: message.author, username: "Hiwada" });
};