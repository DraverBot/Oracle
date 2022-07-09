const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'gend',
    description: "Termine un giveaway",
    permissions: ['manage_guild'],
    aliases: ['giveaway-end'],
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
    let id = args[0];
    if (!id) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Pas d'identifiant")
        .setDescription(`Merci de préciser l'identifiant du message du giveaway`)
        .setColor('#ff0000')
    ] });
    
    client.db.query(`SELECT * FROM giveaways WHERE channel_id="${message.channel.id}" AND guild_id="${message.guild.id}" AND ended="0"`, (err, req) => {
        if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

        let gw = req.find(x => x.message_id === id);
        if (!gw) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Pas de giveaway")
            .setColor('#ff0000')
            .setDescription(`Je ne trouve pas de giveway avec l'id \`${id}\` qui n'est pas terminé dans <#${message.channel.id}>`)
        ] });

        client.GiveawayManager.end(message.guild, gw);
    });
};