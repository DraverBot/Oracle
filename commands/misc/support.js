const { lineReply, package } = require('../../assets/functions.js');
const { Message } = require('discord.js');

module.exports.help = {
    name: 'support',
    description: "Affiche le lien du serveur de support.",
    aliases: ['support-server', 'support-server'],
    permissions: [],
    private: false,
    dm: true,
    cooldown: 1
};

/**
 * @param {Message} message 
 */
module.exports.run = (message) => {
    lineReply(message.id, message.channel, `Soyez informé de l'état du bot directement de puis son serveur de support\n\n${package().configs.support}`);
}