const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'rank',
    description: "Affiche les informations de niveaux d'un utilisateur mentionné.",
    aliases: ['lvl'],
    permissions: [],
    private: false,
    dm : false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefx 
 */
module.exports.run = (message, args, client, prefx) => {
    client.db.query(`SELECT * FROM configs WHERE guild_id="${message.guild.id}"`, (err, req) => {
        if (err) {
            console.log(err);
            message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
            return;
        };

        if (req.length === 0 || req[0].level_enable === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Désactivé")
            .setDescription(`Oops, le système de niveaux est désactivé sur ce serveur`)
            .setColor('#ff0000')
        ] });

        const user = ( message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member ).user;
        client.db.query(`SELECT * FROM levels WHERE guild_id="${message.guild.id}" AND user_id="${user.id}"`, (error, request) => {
            if (error) {
                console.log(error);
                message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
                return;
            };

            if (request.length === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Aucune donnée")
                .setDescription(`Oops, <@${user.id}> n'a envoyé aucun message sur \`${message.guild.name}\``)
                .setColor('#ff0000')
            ] });

            const embed = package.embeds.classic(user)
                .setTitle("rank " + user.username)
                .addFields(
                    {
                        name: "Niveau",
                        value: `Niveau **${functions.numberToHuman(request[0].level)}**`,
                        inline: false
                    },
                    {
                        name: "Messages",
                        value: `Messages totaux : ${functions.numberToHuman(request[0].total)}`,
                        inline: false
                    },
                    {
                        name: 'Messages restants',
                        value: `**${functions.numberToHuman(parseInt(request[0].objectif) - parseInt(request[0].messages))} messages** restants avant de passer au niveau supérieur`,
                        inline: false
                    }
                )
                .setColor('ORANGE')
            
            message.channel.send({ embeds: [ embed ] });

        });
    })
};