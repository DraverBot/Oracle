const Discord = require('discord.js');
const functions = require('../assets/functions.js');
const package = functions.package();

module.exports = {
    event: "messageDelete",
    /**
     * @param {Discord.Message} message 
     */
    execute: (message) => {
        if (!message.guild) return;

        if (!message.channel.snipes) {
            message.channel.snipes = new Discord.Collection();
            message.channel.snipes.set(0, message);
        } else {
            message.channel.snipes.set(message.channel.snipes.length, message);
        };
    }
}