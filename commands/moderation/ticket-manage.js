const Discord = require('discord.js');
const functions = require('../../assets/functions.js');
const package = functions.package();

module.exports.help = {
    name: 'ticket-config',
    description: "Configurez un panel de ticket. Utilisez \`create\` pour le créer et \`delete\` pour le supprimer.",
    aliases: ['configtickets', 'config-tickets', 'tickets-config', 'ticket-panel', 'ticket-configs'],
    permissions: ['manage_guild'],
    cooldown: 5,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args, client, prefix) => {
    const action = args.shift();
    
    if (action == 'create') {
        message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Nom du panel")
            .setDescription(`Je vais créer un nouveau panel, sur quel sujet porte-t-il ?\n\nVous avez deux minutes. Répondez par \`cancel\` pour annuler`)
            .setColor('PURPLE')
        ] }).then((menu) => {
            var trash = [menu];
            
            const collector = message.channel.createMessageCollector({ filter: x => x.author.id === message.author.id, time: 120000 });
            let step = 'sujet';

            let channel;
            let sujet;

            collector.on('collect', (msg) => {
                trash.push(msg);

                if (msg.content.toLowerCase() === 'cancel') return collector.stop('cancel');

                if (step === 'channel') {
                    let mentionnedChannel = msg.mentions.channels.first() || message.guild.channels.cache.get(msg.content) || message.guild.channels.cache.find((chan) => chan.name === msg.content.toLowerCase());
                    if (!mentionnedChannel) {
                        message.channel.send({ embeds: [ package.embeds.noChannel(message.author) ] }).then((x) => {
                            trash.push(x);
                        });

                        return;
                    };

                    channel = mentionnedChannel;
                    collector.stop('finish');
                } else if (step === 'sujet') {
                    collector.resetTimer();

                    if (msg.content.includes('"')) return message.channel.send({ embeds: [ package.embeds.guillement(message.author) ] }).then((x) => {trash.push(x)});

                    sujet = msg.content;
                    message.channel.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle("Salon du panel")
                        .setColor('PURPLE')
                        .setDescription(`Description enregistrée sur ${sujet}.\nDans quel salon dois-je envoyer le message ?\nRépondez par un nom, un identifiant ou une mention.\nVous disposez de 2 minutes pour répondre. Répondez par \`cancel\` pour annuler.`)
                    ] }).then((x) => {
                        trash.push(x);
                    });

                    step = 'channel';
                };
            });

            collector.on('end', (collected, reason) => {
                trash.forEach((msg) => {
                    msg.delete().catch(() => {});
                });
                if (reason === 'cancel') return message.channel.send({ embeds: [ package.embeds.cancel() ] }).catch(() => {});

                if (reason === 'finish') {
                    message.channel.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle("Compris")
                        .setDescription(`Je crée un panel de ticket dans <#${channel.id}> ${package.emojis.loading}`)
                        .setColor('GREEN')
                    ] });

                    client.TicketsManager.createPanel({ guild: message.guild, channel: channel, subject: sujet, user: message.author });
                };
            });
        })
    } else if (action == 'delete') {
        const msgId = args[0];
        
        client.db.query(`SELECT * FROM tickets WHERE guild_id="${message.guild.id}"`, (err, file) => {
            if (err) return console.log(err) & message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

            const ticket = file.find((x) => x.message_id === msgId && x.type === 'ticket-panel');

            if (!ticket) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Identifiant invalide")
                .setDescription(`Oops, L'identifiant fournit est invalide.\nMerci de préciser l'identifiant du panel de ticket à supprimer`)
                .setColor('#ff0000')
            ] });

            const msgChannel = message.guild.channels.cache.get(ticket.channel_id);
            if (!msgChannel) return message.channel.send({ embeds: [ package.embeds.noChannel(message.author) ] });

            const msg = msgChannel.messages.cache.get(msgId);
            if (!msg) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Pas de message")
                .setColor('#ff0000')
                .setDescription(`Oops, je ne trouve pas le message du panel de ticket. Essayez en citant ce dernier.`)
            ] });

            client.db.query(`DELETE FROM tickets WHERE guild_id="${message.channel.id}" AND message_id="${msgId}"`, (error, request) => {
                if (error) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] }) & console.log(error);

                msg.delete().catch(() => {});
    
                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Panel supprimé")
                    .setDescription(`Le panel d'id \`${msgId}\` a été supprimé`)
                    .setColor(message.guild.me.displayHexColor)
                ] });
            });            
        });
    };
};