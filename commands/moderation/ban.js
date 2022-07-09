const emojis = require('../../assets/data/emojis.json');
const Discord = require('discord.js');
const embeds = require('../../assets/embeds');
const functions = require('../../assets/functions');

module.exports.help = {
    name: 'ban',
    permissions: ['ban_members'],
    description: "Permet de bannir un membre",
    aliases: [],
    private: false,
    dm: false,
    cooldown: 15
};

/**
 * @param {Discord.Message} message
 */
module.exports.run = (message, args, client, prefix) => {
    let member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();
    if (!member) return message.channel.send({embeds: [embeds.noUser(message.author)]});

    if (!member.bannable) return message.channel.send({content: `Je ne peux pas bannir ce membre.`});
    
    if (!functions.checkAllConditions(message.guild, message.channel, message.member, member)) return;

    const reason = args.slice(1).join(' ');
    if (!reason) return message.channel.send({ embeds: [embeds.noReason(message.author)] });

    const banned = new Discord.MessageEmbed()
        .setTitle("Banni")
        .setColor('DARK_RED')
        .setDescription(`${emojis.ba}${emojis.nn}${emojis.ed}\n<@${member.user.id}> a été banni par ${message.author.tag} pour la raison : \`\`\`${reason}\`\`\``)
        .setTimestamp()
        .setThumbnail(member.user.avatarURL({ format: 'png' }))
        .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({dynamic: true})})

    member.user.send({ embeds: [banned] }).catch(() => {});
    message.channel.send({ embeds: [ banned ] });

    member.ban({ reason: `${reason} ( ${message.author.tag} : ${message.author.id} )` }).catch(() => {});
}