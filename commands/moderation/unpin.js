const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'unpin',
    aliases: ["desepingle", "désepingle"],
    permissions: ['manage_messages'],
    description: "Désepingle un message. Utilisez un identifiant.",
    cooldown: 5,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message 
 */
module.exports.run = (message, args) => {
    message.delete().catch(() => {});

    const msgId = args[0];
    const msg = message.channel.messages.cache.get(msgId);

    if (!msg) return message.channel.send({ content: `<@${message.author.id}>, ce message est introuvable, essayez avec un identifiant, et si ça ne marche toujours pas, exécutez la commande en répondant au message en question.` });

    msg.unpin().catch(() => {});

    message.channel.send({ content: "Désépinglé ✅" });
}