const Discord = require('discord.js');
const functions = require('../../assets/functions.js');
const package = functions.package();

module.exports.help = {
    name: 'invite',
    aliases: ['link'],
    description: "Envoie le lien d'invitation du bot",
    permissions: [],
    cooldown: 1,
    private: false,
    dm: true
};

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports.run = (message, args, client, prefix) => {
    const link = `https://bit.ly/3NUdTvE`;

    message.channel.send({ content: `Invitez-moi avec ce lien :\n<${link}>` }).catch(() => {});
}