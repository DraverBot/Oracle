const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'avatar',
    aliases: ['pp', 'pdp'],
    permissions: [],
    description: "Affiche la photo de profil d'un utilisateur",
    cooldown: 5,
    private: false,
    dm: true
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args) => {
    let member = message.guild.members.cache.get(args[0]) || message.mentions.members.first() || message.member;
    let avatar = member.user.avatarURL({ dynamic: true, size: 4096 });

    functions.lineReply(message.id, message.channel, `Voici l'avatar de **${member.user.tag}** :\n${avatar}`);
}