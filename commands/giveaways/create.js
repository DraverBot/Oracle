const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const ms = require('ms');
const moment = require('moment');
moment.locale('fr');

module.exports.help = {
    name: 'gcreate',
    description: "Crée un giveaway avec un système de messages",
    aliases: ['giveaway-create'],
    permissions: ['manage_guild'],
    dm: false,
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
    let time = null;
    let reward = null;
    let winnerCount = null;
    let channel = null;


    const msgs = [
        {
            content: "Combien de temps le giveaway doit-il durer ?",
            value: 'time',
            type: 'time'
        },
        {
            content: "Quelle est la récompense du giveaway ?",
            value: 'reward',
            type: 'text'
        },
        {
            content: "Combien de gagnants doit-il y avoir ?",
            value: 'winnerCount',
            type: 'number'
        },
        {
            content: "Dans quel salon le giveaway a-t-il lieu ?",
            value: 'channel',
            type: "channel"
        }
    ];

    let index = 0;
    let max = 3;

    let messages = new Discord.Collection();

    const collector = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, time: 120000 });
    const send = (content) => {
        const embed = package.embeds.classic(message.author)
            .setTitle("Création de giveaway")
            .setAuthor({ name: `Étape ${index + 1}/4`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(content + `\n\nTapez \`cancel\` pour annuler la commande à tout moment`)
            .setColor('ORANGE')

        message.channel.send({ embeds: [ embed ] }).then((sent) => {
            messages.set(sent.id, sent);
        });
    };

    send(msgs[index].content);

    collector.on('collect', (msg) => {
        messages.set(msg.id, msg);
        if (msg.content.toLowerCase() === 'cancel') return collector.stop('cancel');

        const x = msgs[index];
        if (x.type === 'channel') {
            let channelT = msg.mentions.channels.first() || message.guild.channels.cache.get(msg.content) || message.guild.channels.cache.find(x => x.name === msg.content);

            if (!channelT) return message.channel.send({ embeds: [ package.embeds.noChannel(message.author) ] }).then((y) => messages.set(y.id, y));
            channel = channelT;
        };
        if (x.type === 'number') {
            if (isNaN(parseInt(msg.content))) return message.channel.send({ embeds: [ package.embeds.invalidNumber(message.author) ] }).then((y) => messages.set(y.id, y));
            winnerCount = parseInt(msg.content);
        };
        if (x.type === 'time') {
            if (!ms(msg.content)) return message.channel.send({ embeds: [ package.embeds.invalidTime(message.author) ] }).then((y) => messages.set(y.id, y));

            time = ms(msg.content);
            console.log(ms(msg.content));
        };
        if (x.type === 'text') {
            reward = msg.content;
        };

        index++;
        if (index > max) return collector.stop('ended');

        send(msgs[index].content);
    });

    collector.on('end', (collected, reason) => {
        message.channel.bulkDelete(messages);
        if (reason === 'cancel') return message.channel.send({ embeds: [ package.embeds.cancel() ] });

        if (reason === 'ended') {
            client.GiveawayManager.start(message.guild, channel, message.author, reward, winnerCount, time);

            message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Giveaway crée")
                .setDescription(`J'ai crée un giveaway dans <#${channel.id}>, avec ${winnerCount} ${winnerCount > 1 ? 'gangants' : 'gagnant'}.\nla récompense est \`\`\`${reward}\`\`\`
Se termine le ${moment(time + Date.now()).format('DD/MM/YYYY à hh:mm:ss')}`)
                .setColor(message.guild.me.displayHexColor)
            ] });
        } else {
            return message.channel.send({ embeds: [ package.embeds.collectorNoMessage(message.author) ] }).catch(() => {});
        };
    });
};