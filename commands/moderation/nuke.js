const Discord = require('discord.js');
const emojis = require('../../assets/data/emojis.json');

module.exports.help = {
    name: 'nuke',
    description: "Nettoie un salon entier",
    cooldown: 10,
    permissions: ['manage_channels'],
    private: false,
    dm: false,
    aliases: []
}

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('oui')
                .setStyle("SUCCESS")
                .setEmoji('✅'),
            new Discord.MessageButton()
                .setCustomId('non')
                .setStyle('DANGER')
                .setEmoji("❌")
        )
    message.channel.send({content: "Êtes-vous sûr de vouloir nettoyer " + `${message.channel.name} ? Cette action est irréversible.`, components: [ row ]}).then(async(valideMSG) => {
        
        const filter = (interaction) => interaction.user.id === message.author.id;

        const nuke = async() => {
            const propreties = {
                name: message.channel.name,
                parentID: message.channel.parentId,
                description: message.channel.topic,
                nsfw: message.channel.nsfw,
                rawPosition: message.channel.rawPosition,
                rateLimit: message.channel.rateLimitPerUser
            };

            const nuked = await message.channel.clone();
            nuked.name = propreties.name;
            nuked.parentId = propreties.parentID;
            nuked.topic = propreties.topic;
            nuked.nsfw = propreties.nsfw;
            nuked.rateLimitPerUser = propreties.rateLimit;

            message.channel.delete().catch(() => {});
            nuked.setPosition(propreties.rawPosition);
            
            nuked.send({content: `Salon nettoyé par ${message.author}`}).catch(() => {});
        };

        const collector = valideMSG.createMessageComponentCollector({filter, time: 120000, max: 1 });
        collector.on('collect', (interaction) => {
            if (interaction.customId === 'oui') {
                nuke();
            } else {
                interaction.reply({content: `${emojis.gsyes} Nettoyage annulé.`});
                collector.stop();
            };
        });
    });
};