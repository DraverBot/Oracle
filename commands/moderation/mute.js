const Discord = require('discord.js');
const { compareRoles, addCase, log } = require('../../assets/functions');
const embeds = require('../../assets/embeds');

module.exports.help = {
    name: 'mute',
    description: "Rend un membre du serveur muet",
    permissions: ['kick_members'],
    aliases: [],
    private: false,
    dm: false,
    cooldown: 10
}

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports.run = (message, args, client, prefix) => {
    let member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

    if (!member) return message.channel.send({ embeds: [ embeds.noUser(message.author) ] });
    let checkRole = compareRoles(member, message.member);

    if (!checkRole) return message.channel.send({ embeds: [ embeds.notEnoughHiger(message.author, member) ] });

    let role = message.guild.roles.cache.find((x) => x.name.toLowerCase() === 'muted');
    if (!role) {
        message.guild.roles.create({
            name: 'Muted',
            color: 'DARK_GREY',
            hoist: false,
            reason: "We need a muted role",
            mentionable: false,
            permissions: []
        }).then((r) => {
            r.permissions.remove('SEND_MESSAGES');
            message.guild.channels.cache.forEach((channel) => {
                if (channel.type === 'GUILD_TEXT') {
                    channel.permissionOverwrites.create(r, {
                        'SEND_MESSAGES': false,
                        'READ_MESSAGE_HISTORY': true
                    }, {
                        reason: "Muted"
                    });
                };
            });

            role = r;
        });
    };

    const reason = args.slice(1).join(' ');
    if (!reason) return message.channel.send({ embeds: [embeds.noReason(message.author)] });

    const muted = new Discord.MessageEmbed()
        .setTitle("Muté")
        .setDescription(`${member} a été réduit au silence par ${message.author.tag}`)
        .setColor('DARK_PURPLE')
        .setTimestamp()
        .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({dynamic: true})})
        .setThumbnail(member.avatarURL({dynamic: false, format: 'png'}))

    member.send({ embeds: [muted] }).catch(() => {});
    member.roles.add([ role ], reason + `. By ${message.author.tag} (${message.author.id})`).catch(() => {});

    log(message.guild, muted);
    addCase(message.guild.id, member.id, message.author.id, reason, 'mute');

    message.channel.send({ embeds: [muted] }).catch(() => {});
}