const Discord = require('discord.js');

module.exports.help = {
    name: 'glist',
    description: "Affiche la liste des giveaways en cours sur le serveur",
    aliases: ['giveaway-list'],
    permissions: ['manage_guild'],
    cooldown: 5,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 */
module.exports.run = (message, args, client) => {
    client.GiveawayManager.list(message.channel, message.author)
};