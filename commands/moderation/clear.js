module.exports.help = {
    name: 'clear',
    aliases: [],
    description: "Nettoie un certain nombre de messages dans un salon",
    permissions: ['manage_messages'],
    private: false,
    dm: false,
    cooldown: 10
}

const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    if (args.length < 1) return message.channel.send({ embeds: [ package.embeds.invalidArg(message.author) ] });
    
    let index = parseInt(args[0]);
    let user = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

    let arg;

    if (!index && user) arg = user;
    else if (index && !user) arg = index;
    else {
        message.channel.send({ embeds: [ package.embeds.invalidArg(message.author) ] });
    };

    if (index && !user) {
        let number = parseInt(index);
        message.delete().catch(() => {}).then((x) => {
            message.channel.bulkDelete(number).catch(() => {});
            message.channel.send({ content: `J'ai supprimé \`${number}\` messag${number > 1 ? 'es' : 'e'}` }).then((x) => {
                setTimeout(() => {
                    x.delete().catch(() => {});
                }, 5000);
            });
        });
    } else {
        message.channel.messages.fetch().then((fetched) => {
            const messages = fetched.filter((x) => x.author.id == arg.id);
            message.channel.bulkDelete(messages).catch(() => {});

            message.channel.send({ content: `J'ai supprimé \`${messages.size}\` messag${messages.size > 1 ? 'es' : 'e'} de <@${arg.id}>` }).then((x) => {
                setTimeout(() => {
                    x.delete().catch(() => {});
                }, 5000);
            });
        });
    };
};