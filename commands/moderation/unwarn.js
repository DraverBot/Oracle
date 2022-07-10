const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'unwarn',
    aliases: ['dewarn'],
    permissions: ['manage_guild'],
    description: "Enlève un avertissement à un utilsateur",
    cooldown: 5,
    private: false,
    dm: false
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

    if (!functions.checkAllConditions(message.guild, message.channel, message.member, member)) return;

    const index = parseInt(args[1]);
    if (!index) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Pas d'id")
        .setDescription(`Merci de spécifier l'id du warn (visible via la commande \`${prefix}modlogs\`)`)
        .setColor('#ff000')
    ] });

    client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${message.guild.id}" AND case_id="${index}" AND action="warn"`, (err, req) => {
        if (err) return console.log(err) & message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

        if (req.length === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Avertissement inexistant")
            .setDescription(`Oops, cet avertissement n'existe pas, ou <@${member.id}> n'a aucun avertissement`)
            .setColor('#ff0000')
        ] });

        client.db.query(`DELETE FROM mod_cases WHERE case_id="${index}"`, (e) => {
            if (e) return console.log(e) & message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

            const log = package.embeds.classic(message.author)
                .setTitle("Avertissement supprimé")
                .setDescription(`<@${message.author.id}> a supprimé l'avertissement de <@${member.id}>`)
                .addField('Raison de l\'avertissement', req[0].reason, false)
                .setColor('GREEN')

            functions.log(message.guild, log);
            message.channel.send({ embeds: [ log ] });
            
            const mp = log;
            mp.setDescription(`<@${message.author.id}> a supprimé votre avertissement sur ${message.guild.name}`);

            member.send({ embeds: [ mp ] }).catch(() => {});
            functions.addCase(message.guild.id, member.id, message.author.id, "Pas de raison pour un déwarn", "unwarn");
        })
    })
};