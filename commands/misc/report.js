const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'contact',
    aliases: ['bug', 'erreur', 'report'],
    description: "Signale un bug à Greensky",
    permissions: [],
    dm: true,
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
    const isEasterEgged = message.content.includes('report') ? true : false;

    const bug = args.join(' ');
    if (!bug) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Bug")
        .setDescription(`Merci de préciser le bug`)
        .setColor('#ff0000')
    ] });

    const embed = package.embeds.classic(message.author)
        .setTitle("Erreur")
        .setDescription(`${message.author.username} ( ${message.author.id} ) a trouvé un bug sur le greensky bot :\n\`\`\`${bug}\`\`\``)
        .setColor('ORANGE')

    const reply = package.embeds.classic(message.author)
        .setTitle("Signalé" + isEasterEgged ? package.emojis.report : "")
        .setDescription(`${package.emojis.gsyes} J'ai signalé ce bug à mon développeur.`)
        .setColor('ORANGE')

    const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setStyle('LINK')
                .setURL('https://discord.gg/G7QDcNkvPS')
                .setLabel('Support'),
            new Discord.MessageButton()
                .setStyle("LINK")
                .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=8`)
                .setLabel("Invitez-moi")
        )
    
    const support = client.guilds.cache.find(x => x.id === '945710914873745419');
    const channel = support.channels.cache.get('954998495977291807');
    channel.send({ embeds: [ embed ] }).catch(() => {});

    message.channel.send({ embeds: [ reply ], components: [ row ] }).catch(() => {});
    message.delete().catch(() => {});
}