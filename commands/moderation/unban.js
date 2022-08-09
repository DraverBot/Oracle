const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'unban',
    description: "Débanni un utilisateur du serveur. Utilisez l'identifiant du membre.",
    aliases: ['deban'],
    permissions: ['ban_members'],
    cooldown: 5,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 */
module.exports.run = (message, args, client) => {
    const id = args[0];
    if (!id) return message.channel.send({ embeds: package.embeds.classic(message.author)
        .setTitle("Identifiant invalide")
        .setDescription(`Vous n'avez pas saisi d'identifiant`)
        .setColor('#ff0000')
    });

    const user = client.users.cache.get(id);
    if (!user) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Identifiant invalide")
        .setDescription(`Je ne trouve pas d'utilisateur d'id \`${id}\`.\nPeut-être que je n'ai aucun contact avec cette personne.`)
        .setColor('#ff0000')
    ] });

    let unbanned = true;
    message.guild.members.unban(user, `Débanni par ${message.author.tag}`).catch(() => {
        unbanned = !unbanned;
    });

    if (!unbanned) {
        if (id.toString().startsWith('38')) {
            return message.channel.send({ embeds: package.embeds.classic(message.author)
                .setTitle("Utilisateur inconnu")
                .setDescription(`Je n'ai pas pu débannir cet utilisateur.\nPeut-être est-il déjà débanni...`)
                .setColor('#ff0000')
            }).then((x) => {
                x.react(package.emojis.loading);
            })
        } else {
            return message.channel.send({ embeds: package.embeds.classic(message.author)
                .setTitle("Utilisateur inconnu")
                .setDescription(`Je n'ai pas pu débannir cet utilisateur.\nVérifiez qu'il soit bien banni.`)
                .setColor('#ff0000')
            });
        };
    };

    const embed = package.embeds.classic(message.author)
        .setTitle("Débannissement")
        .setDescription(`L'utilisateur d'id \`${id}\` a été débanni.`)
        .setColor('GREEN')

    message.channel.send({ embeds: [ embed ] });

    functions.log(message.guild, embed);
    functions.addCase(message.guild.id, id, message.author.id, 'no reason', 'unban');
}