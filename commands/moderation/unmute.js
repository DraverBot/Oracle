module.exports.help = {
    name: 'unmute',
    description: `Démute un membre mentionné`,
    aliases: ['demute'],
    permissions: ['manage_roles'],
    dm: false,
    private: false,
    cooldown: 10
};

const Discord = require('discord.js');
const emojis = require('../../assets/data/emojis.json');
const embeds = require('../../assets/embeds');
const functions = require('../../assets/functions');
const package = functions.package();

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args) => {
    let member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();
    if (!member) return message.channel.send({ embeds:[embeds.noUser(message.author)] });

    let checkRoles = functions.compareRoles(member, message.member);
    if (!checkRoles) return message.channel.send({ embeds: [embeds.notEnoughHiger(message.author, member)] });

    let role = message.guild.roles.cache.find((x) => x.name === 'Muted');
    const stop = () => {
        message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Non muté")
            .setDescription(`Oops, \`${member.user.tag}\` n'est pas muté.`)
        ] });
    };

    if (!role) return stop();
    if (!member.roles.cache.has(role.id)) return stop();

    let go = true;
    member.roles.remove([ role ]).catch(() => {go = false})
    
    if (go == false) return message.channel.send({ content: `${emojis.gsno} | Il y a eu un problème, réessayez la commande` });

    const unmuted = new Discord.MessageEmbed()
        .setTimestamp()
        .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({ dynamic: true })})
        .setThumbnail(member.avatarURL({dynamic: false, format: 'png'}))
        .setColor('GREEN')
        .setDescription(`${member} a été démuté par ${message.author.tag}`)
    
    message.channel.send({ embeds:[unmuted] }).catch(() => {});
    member.send({embeds:[unmuted]}).catch(() => {});

    functions.log(message.guild, unmuted);
    functions.addCase(message.guild.id, member.id, message.author.id, 'no reason', 'unmute');
};