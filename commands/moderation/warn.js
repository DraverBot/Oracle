const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'warn',
    description: "Avertit un membre",
    aliases: ['avertit'],
    permissions: ['manage_guild'],
    dm: false,
    private: false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    
    if (!member) return message.channel.send({ embeds: [ package.embeds.noUser(message.author) ] });
    if (!functions.compareRoles(member, message.member)) return message.channel.send({ embeds: [ package.embeds.notEnoughHiger(message.author, member) ] });
    if (member.id === message.guild.ownerId) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Propriétaire")
        .setDescription(`Oops, il semblerait que <@${member.id}> soit le propriétaire du serveur.`)
        .setColor('#ff0000')
    ] });
    if (!functions.compareRoles(member, message.guild.me)) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Trop haut")
        .setDescription(`Oops, il semblerait que cet utilisateur soit supérieur ou égal à moi dans la hiérarchie des rôles`)
        .setColor('#ff0000')
    ] });

    const reason = args.slice(1).join(' ');
    if (!reason) return message.channel.send({ embeds: [ package.embeds.noReason(message.author) ] });

    if (reason.includes('"')) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Erreur")
        .setDescription(`Oops, pour des raisons de stockage de données, je ne peux pour l'instant pas inclure de \`"\` dans une raison.`)
        .setColor('#ff0000')
    ] });

    functions.addCase(message.guild.id, member.id, message.author.id, reason, "warn");
    const warn = package.embeds.classic(member.user)
        .setTitle("Avertissement")
        .addFields(
            {
                name: 'Serveur',
                value: message.guild.name,
                inline: true
            },
            {
                name: "Modérateur",
                value: `<@${message.author.id}> ( ${message.author.id} ${message.author.tag} )`,
                inline: true
            },
            {
                name: "Raison",
                value: `\`\`\`${reason}\`\`\``,
                inline: true
            }
        )
        .setColor('#ff0000')
        .setThumbnail(member.avatarURL({ dynamic: false, format: 'png' }))

    message.channel.send({ embeds: [ warn ] });
    functions.log(message.guild, warn);
    member.send({ embeds: [ warn ] }).catch(() => {});
}