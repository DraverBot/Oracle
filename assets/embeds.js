const { User, MessageEmbed } = require('discord.js');
const colors = require('./colors.json');
const emojis = require('./emojis.json');

/**
 * @param {User} user
 */
const basic = (user) => {
    return new MessageEmbed()
        .setTimestamp()
        .setFooter({ text: (user.username || user.client.username), iconURL: (user.displayAvatarURL({ dynamic: true }) || user.client.user.username) })
};

module.exports = {
    classic: basic,
    onlyServer: (user) => {
        return basic(user)
            .setTitle("Commande exclusive")
            .setColor(colors.onlyServers)
            .setDescription(`Cette commande n'est exécutable qu'en messages privés`)
    }
}