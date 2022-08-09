const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'mail',
        description: "Mail",
        private: false,
        dm: true,
        permissions: [],
        aliases: [],
        cooldown: 5
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     * @param {Discord.Client} client 
     */
    run: (message, args, client) => {
        client.MailsManager.mailbox(message.author, message.channel);
    }
}