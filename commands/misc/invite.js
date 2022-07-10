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
    const link = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=8`;
    const support = `https://discord.gg/G7QDcNkvPS`;

    message.channel.send({ content: `Invitez-moi avec ce lien :\n<${link}>\n\nRejoignez le support avec ce lien\n${support}` }).catch(() => {});
}