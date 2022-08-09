const Discord = require('discord.js');
const functions = require('../../assets/functions.js');
const package = functions.package();

module.exports.help = {
    name: 'sondage',
    description: "Faites un sondage, utilisez-là de cette manière\n\n`gs sondage <sondage> --choix 1 --choix 2... --choix 7` ou simplement aucun choix",
    aliases: ['poll'],
    permissions: ['manage_guild'],
    cooldown: 10,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports.run = (message, args, client, prefix) => {
    if (args.length === 0) return message.channel.send({ embeds: [ package.embeds.invalidArg(message.author) ] });
    
    const options = args.join(' ').split('--');
    const poll = options.shift();

    if (!poll) return message.channel.send({ embeds: [ package.embeds.noReason(message.author) ] })

    if (options.length > 9) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Argument invalide")
        .setDescription(`:x: La commande sondage ne prend que 9 arguments`)
        .setColor('RED')
    ] })

    var reacts = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

    let bin = options.length < 2 ? true:false;

    const sondage = package.embeds.classic(message.author)
        .setTitle("Sondage")
        .setAuthor(poll)
        .setColor(message.guild.me.displayColor)

    if (bin) {
        sondage.setDescription(`Oui : 👍\n\nNon : 👎`)
    } else {
        sondage.setDescription(options.map((x, i) => `${x} : ${reacts[i]}`).join('\n\n'));
    };

    message.channel.send({ embeds: [ sondage ] }).then(async(msg) => {
        if (bin) {
            await msg.react('👍');
            await msg.react('👎');
        } else {
            for (let i = 0; i < options.length; i++) {
                await msg.react(reacts[i]);
            };
        };
    });

    message.delete().catch(() => {});
};