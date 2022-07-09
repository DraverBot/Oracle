const Discord = require('discord.js');
const emojis = require('../../assets/data/emojis.json');
const functions = require('../../assets/functions.js');
const package = functions.package();

module.exports.help = {
    name: 'kick',
    description: "Expulse un membre du serveur pour une raison donnée",
    permissions: ['kick_members'],
    aliases: ['expulse'],
    private: false,
    dm: false,
    cooldown: 10
};

/**
 * @param {Discord.Message} message
 */
 module.exports.run = (message, args, client, prefix) => {
    let member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();
    if (!member) return message.channel.send({embeds: [ package.embeds.noUser(message.author) ] });

    if (!member.bannable) return message.channel.send({content: `Je ne peux pas expulser ce membre.`});
    let mHighest = member.roles.highest.position;
    let aHighest = message.member.roles.highest.position;

    if (mHighest > aHighest || mHighest == aHighest) return message.channel.send({ content: `${member.user.tag} est au-dessus ou égal à vous dans la hiérarchie des rôles.` });
    if (member.id === message.guild.ownerId) return message.channel.send({ content: `Ce membre est le propriétaire du serveur.` });

    if (member.id === message.author.id) return message.channel.send({ content:`Je ne vous laisserais pas vous expulser tout seul.` });

    const reason = args.slice(1).join(' ');
    if (!reason) return message.channel.send({ embeds: [package.embeds.noReason(message.author)] });

    const kicked = new Discord.MessageEmbed()
        .setTitle("Expulsé")
        .setColor('DARK_RED')
        .setDescription(`<@${member.user.id}> a été expulsé(e) par ${message.author.tag} pour la raison : \`\`\`${reason}\`\`\``)
        .setTimestamp()
        .setThumbnail(member.user.avatarURL({ format: 'png' }))
        .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({dynamic: true})})

    member.user.send({ embeds: [kicked] }).catch(() => {});
    message.channel.send({ embeds: [ kicked ] });

    functions.log(message.guild, kicked);
    functions.addCase(message.guild.id, member.id, message.author.id, reason, 'kick');

    member.kick({ reason: `${reason} ( ${message.author.tag} : ${message.author.id} )` }).catch(() => {});
}