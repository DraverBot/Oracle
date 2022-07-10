const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'top',
    aliases: ['levels'],
    description: "Affiche le classement des niveaux sur le serveur",
    permissions: [],
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
    client.db.query(`SELECT * FROM configs WHERE guild_id="${message.guild.id}"`, (err, req) => {
        if (err) {
            console.log(err);
            message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

            return;
        };

        if (req.length === 0 || req[0].level_enable === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Désactivé")
            .setDescription(`Oops, le système de niveaux n'est pas activé sur \`${message.guild.name}\``)
            .setColor('#ff0000')
        ] });

        client.db.query(`SELECT * FROM levels WHERE guild_id="${message.guild.id}"`, (error, request) => {
            if (error) {
                console.log(error);
                message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

                return;
            };

            const levels = request.sort((a, b) => b.total - a.total);
            
            if (request.length < 5) {   
                const embed = package.embeds.classic(message.author)
                    .setTitle("Niveaux")
                    .setDescription(`Voici le top **${functions.numberToHuman(levels.length)}** des niveaux du serveur.`)
                    .setColor('ORANGE')

                levels.forEach((lvl) => {
                    embed.addField(
                        (levels.indexOf(lvl) + 1).toString(),
                        `<@${lvl.user_id}>
> Niveau **${functions.numberToHuman(parseInt(lvl.level))}**
> Avec un total de **${functions.numberToHuman(parseInt(lvl.total))} messages**`,
                        false
                    );
                });

                message.channel.send({ embeds: [ embed ] });
            } else {
                let now = package.embeds.classic(message.author)
                    .setTitle("Niveaux")
                    .setDescription(`Voici le top **${functions.numberToHuman(levels.length)}** des niveaux du serveur.`)
                    .setColor('ORANGE')

                var embeds = [];
                let pile = false;
                let count = 0;

                for (let i = 0; i < levels.length; i++) {
                    const lvl = levels[i];

                    now.addField(
                        (levels.indexOf(lvl) + 1).toString(),
                        `<@${lvl.user_id}>
> Niveau **${functions.numberToHuman(parseInt(lvl.level))}**
> Avec un total de **${functions.numberToHuman(parseInt(lvl.total))} messages**`,
                        false
                    );

                    pile = false;

                    count++;
                    if (count === 5) {
                        count=0;
                        pile = true;
                        embeds.push(now);

                        now = null;
                        now = package.embeds.classic(message.author)
                            .setTitle("Niveaux")
                            .setDescription(`Voici le top **${functions.numberToHuman(levels.length)}** des niveaux du serveur.`)
                            .setColor('ORANGE')

                    }
                };

                if (!pile) embeds.push(now);
            
                functions.pagination(message.author, message.channel, embeds, `classement`);
            }
        })
    })
};