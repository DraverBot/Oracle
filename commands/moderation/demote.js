const Discord = require('discord.js');
const functions = require('../../assets/functions.js');

module.exports.help = {
    name: 'demote',
    description: "Retire un ou plusieurs roles à un utilisateur. Utilisez `help` pour avoir toutes les informations.",
    aliases: ['downgrade', 'role-remove'],
    permissions: ['MANAGE_ROLES'],
    private: false,
    dm: false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    if ((args[0] ||'help').toLowerCase() === 'help') {
        const help = new Discord.MessageEmbed()
            .setTimestamp()
            .setColor(message.guild.me.displayHexColor)
            .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({ dynamic: true })})
            .setDescription(`Nom: \`${prefix}demote\`\nDescription: Retire un ou plusieurs rôles à un utilisateur.\n\nArguments: vous pouvez utilisez \`${prefix}demote @utilisateur all\` pour retirer tous les rôles de cet utilisateur\n\`${prefix}demote @utilisateur highest\` pour retirer le rôle le plus haut de cet utilisateur.`)
            .setTitle("Aide")

        message.channel.send({ embeds: [ help ] });
    } else {
        const member = message.mentions.members.first() || message.guild.members.cache.find((x) => x.name === args[0] || x.id === args[0]);

        // If there's no member :
        if (!member) return message.channel.send({ content: "Cet utilisateur n'existe pas" });

        const action = (args[1] || 'none').toLowerCase(); // I'm just doing this for have someting in lower case
        if (action === 'none' || action !== ('all' && 'highest')) return message.channel.send({ content: "Merci de saisir un paramètre parmis les deux proposés : `all` et `highest`" }); // If action doesn't correspond, reply to user.

        if (member.id === message.author.id) return message.channel.send({ content: "Vous ne pouvez pas vous auto-dégrader." }) // When the target is the author.
        if (message.guild.ownerId && message.guild.ownerId === member.id) return message.channel.send({ content: "Cet utilisateur est le propriétaire." }) // The member is the big boss
        if (member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send({ content: "Cet utilisateur est supérieur ou égal à vous dans la hiérarchie des rôles." }) // Member is too powerfull for the executor.
        if (member.roles.highest.position >= message.guild.me.roles.highest.position) return message.channel.send({ content: "Ce membre est supérieur ou égal à moi dans la hiérarchie des rôles" }) // If the target is too much powerfull for the bot

        if (member.roles.cache.size - 1 === 0) return message.channel.send({ content: "Cet utilisateur n'a aucun rôle" }) // User hasn't any role (exept everyone)

        if (action === "all") {
            member.roles.remove(member.roles.cache).catch(() => {});

            // Completly demoted
            message.channel.send({ content: `<@${message.author.id}> a été complètement dégradé.` });
        } else {
            const role = member.roles.highest;
            member.roles.remove([ role ]).catch(() => {});

            // Highest role removed
            message.channel.send({ content: `<@${message.author.id}> a été retiré de son rôle le plus haut ( ${role.name} )` });
        }
    }
}