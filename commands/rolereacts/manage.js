const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'role-react-manage',
    aliases: ['rrm', 'manage-rolesreact', 'manage-rolereact', 'rm'],
    description: "Configure les rôles à réactions",
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
    return functions.reply(message, package.embeds.classic(message.author)
        .setTitle("Commande périmée")
        .setDescription(`Cette commande n'est plus actuelle, utilisez la commande \`/role-react\` à la place.`)
        .setColor('ORANGE')
    )
    const action = (args.shift() || 'help').toLowerCase();

    if (action === 'help') {
        const help = package.embeds.classic(message.author)
            .setTitle("Page d'aide")
            .setDescription(`La commande \`${prefix}role-react-manage\` permet de configurer les rôles a réactions sur le serveur.\nUtiliisez :\n\`set\` pour en configurer un\n\`list\` pour afficher la liste\n\`remove\` pour en retirer un.`)
            .setColor('ORANGE')

        message.channel.send({ embeds: [ help ] });
    } else if (action === 'list') {
        client.db.query(`SELECT * FROM rolesreact WHERE guild_id="${message.guild.id}"`, (err, req) => {
            if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

            if (req.length === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Pas de rôles à réaction")
                .setDescription(`Il n'y a aucun rôle à réaction configuré sur ce serveur.`)
                .setColor('#ff0000')
            ] });

            if (req.length > 5) {
                let now = package.embeds.classic(message.author)
                    .setTitle("Rôles à réaction")
                    .setDescription(`Voici la liste des rôles à réaction.`)
                    .setColor('ORANGE')
                
                var embeds = [];
                let pile = false;
                let count = 0;
                
                for (let i = 0; i < req.length; i++) {
                    const warn = req[i];
                    
                    now.addField(`Rôle à réaction`, `Dans <#${warn.channel_id}>\nIdentifiant du message: \`${warn.message_id}\`\nRôle: <@&${warn.role_id}>`, false);
    
                    pile = false;
    
                    count++;
                    if (count === 5) {
                        count=0;
                        pile = true;
                        embeds.push(now);
    
                        now = null;
                        now = package.embeds.classic(message.author)
                            .setTitle("Rôles à réaction")
                            .setDescription(`Voici la liste des rôles à réaction.`)
                            .setColor('ORANGE')
    
                    }
                };
    
                if (!pile) embeds.push(now);
                
                functions.pagination(message.author, message.channel, embeds, `rôles à réaction`);
            } else {
                const embed = package.embeds.classic(message.author)
                    .setTitle("Rôles à réaction")
                    .setDescription(`Voici la liste des rôles à réaction.`)
                    .setColor('ORANGE')
    
                req.forEach((warn) => {
                    embed.addField(`Rôle à réaction`, `Dans <#${warn.channel_id}>\nIdentifiant du message: \`${warn.message_id}\`\nRôle: <@&${warn.role_id}>`, false);
                });
    
                message.channel.send({ embeds: [ embed ] });
            }
        });
    } else if (action === 'set') {
        const trash = new Discord.Collection();

        message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Rôle a réaction")
            .setDescription(`Quel est le salon que vous souhaitez configurer ?\nVous avez **2 minutes** et tapez \`cancel\` pour annuler`)
            .setColor('ORANGE')
        ] }).then((sent) => {
            trash.set(sent.id, sent);
            let step = 'channel';
            let channel;
            let message_id;
            let role;
            let emoji;

            const send = (content, color, title) => {
                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle(title)
                    .setDescription(content)
                    .setColor(color)
                ] }).then(x => {
                    trash.set(x.id, x);
                });
            };

            const collector = message.channel.createMessageCollector({ filter: x => x.author.id === message.author.id, time: 120000 });
            collector.on('collect', (msg) => {
                trash.set(msg.id, msg);
                if (msg.content.toLowerCase() === 'cancel') return collector.stop('cancel');

                collector.resetTimer({ time: 120000 });

                if (step === 'channel') {
                    let test = msg.mentions.channels.first() || message.guild.channels.cache.get(msg.content) || msg.guild.channels.cache.find(x => x.name.toLowerCase() === msg.content.toLowerCase().replace(/ +/g, '-'));
                    if (!test) return send(`Oops, il semblerait que ce ne soit pas un salon valide. Réessayez avec le nom, l'identifiant ou la mention.`, '#ff0000', 'Salon invalide');

                    channel = test;
                    step = 'message';
                    send(`Quel est l'id du message ?.\nVous avez **2 minutes**. Tapez \`cancel\` pour annuler`, 'ORANGE', 'Message');
                    return;
                };
                if (step === 'message') {
                    let test = channel.messages.fetch(msg.content);
                    if (!test) return send(`Ce n'est pas un message valide. Réessayez avec l'identifiant du message dans <#${channel.id}>`, '#ff0000', 'Message invalide')

                    message_id = msg.content;
                    step = 'role';
                    send(`Quel est le rôle donné ? Répondez par un identifiant ou une mention.\n*Conseil: exécutez la commande dans un ticket privé, mentionnez le rôle puis supprimez le ticket. \`${prefix}ticket create salon privé\`, ou nukez le salon: \`${prefix}nuke\`*\nVous avez **2 minutes**. Tapez \`cancel\` pour annuler`, 'ORANGE', "Rôle");
                    return;
                };
                if (step === 'role') {
                    let test = msg.mentions.roles.first() || msg.guild.roles.cache.get(msg.content);
                    if (!test) return send(`Ce rôle est invalide. Réessayez avec l'identifiant ou la mention.`, '#ff0000', 'Rôle invalide');

                    role = test;
                    step = "emoji";

                    message.channel.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle("Émoji")
                        .setDescription(`Quel est l'émoji associé à <@&${role.id}> ? Mettez l'émoji en réaction à ce message.`)
                        .setColor('ORANGE')
                    ] }).then((emojiMsg) => {
                        trash.set(emojiMsg.id, emojiMsg);

                        const reactCollector = emojiMsg.createReactionCollector({ filter: (r, u) => u.id === message.author.id, time: 120000, max: 1 });
                        reactCollector.on('collect', (reaction, user) => {
                            emoji = reaction.emoji;
                            collector.stop('ended');
                        });
                    });
                };
            });

            collector.on('end', (collected, reason) => {
                message.channel.bulkDelete(trash);

                if (reason === 'cancel') return message.channel.send({ embeds: [ package.embeds.cancel() ] });
                if (reason === 'ended') {
                    channel.messages.fetch().then((fetched) => {
                        const msg = fetched.find(x => x.id === message_id);
                        if (!msg) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                            .setTitle("Erreur")
                            .setColor('#ff0000')
                            .setDescription(`je ne trouve pas le message`)
                        ] });

                        msg.react(emoji);

                        client.db.query(`INSERT INTO rolesreact (guild_id, channel_id, message_id, role_id, emoji) VALUES ("${message.guild.id}", "${message.channel.id}", "${msg.id}", "${role.id}", "${emoji.identifier}")`, (err, req) => {
                            if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

                            message.channel.send({ embeds: [ package.embeds.classic(message.author)
                                .setTitle("Rôle à réaction")
                                .setDescription(`Le rôle <@${role.id}> a été associé à la réaction <${emoji}> dans le salon <#${channel.id}>, au message d'id \`${message_id}\``)
                                .setColor('ORANGE')
                            ] });
                        });
                    });
                }
            });
        });
    } else if (action === 'remove') {
        const trash = new Discord.Collection();

        message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Rôle a réaction")
            .setDescription(`Quel est le salon du message que vous souhaitez annuler ?\nVous avez **2 minutes** et tapez \`cancel\` pour annuler`)
            .setColor('ORANGE')
        ] }).then((sent) => {
            trash.set(sent.id, sent);
            let step = 'channel';
            let channel;
            let message_id;
            let role;
            let emoji;

            const send = (content, color, title) => {
                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle(title)
                    .setDescription(content)
                    .setColor(color)
                ] }).then(x => {
                    trash.set(x.id, x);
                });
            };

            const collector = message.channel.createMessageCollector({ filter: x => x.author.id === message.author.id, time: 120000 });
            collector.on('collect', (msg) => {
                trash.set(msg.id, msg);
                if (msg.content.toLowerCase() === 'cancel') return collector.stop('cancel');

                collector.resetTimer({ time: 120000 });

                if (step === 'channel') {
                    let test = msg.mentions.channels.first() || message.guild.channels.cache.get(msg.content) || msg.guild.channels.cache.find(x => x.name.toLowerCase() === msg.content.toLowerCase().replace(/ +/g, '-'));
                    if (!test) return send(`Oops, il semblerait que ce ne soit pas un salon valide. Réessayez avec le nom, l'identifiant ou la mention.`, '#ff0000', 'Salon invalide');

                    channel = test;
                    step = 'message';
                    send(`Quel est l'id du message ?.\nVous avez **2 minutes**. Tapez \`cancel\` pour annuler`, 'ORANGE', 'Message');
                    return;
                };
                if (step === 'message') {
                    let test = channel.messages.fetch(msg.content);
                    if (!test) return send(`Ce n'est pas un message valide. Réessayez avec l'identifiant du message dans <#${channel.id}>`, '#ff0000', 'Message invalide')

                    message_id = msg.content;
                    step = 'emoji';
                    message.channel.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle("Émoji")
                        .setDescription(`Quel est l'émoji que je dois retirer ? Mettez l'émoji en réaction à ce message.`)
                        .setColor('ORANGE')
                    ] }).then((emojiMsg) => {
                        trash.set(emojiMsg.id, emojiMsg);

                        const reactCollector = emojiMsg.createReactionCollector({ filter: (r, u) => u.id === message.author.id, time: 120000, max: 1 });
                        reactCollector.on('collect', (reaction, user) => {
                            emoji = reaction.emoji;
                            collector.stop('ended');
                        });
                    });
                };
            });

            collector.on('end', (collected, reason) => {
                message.channel.bulkDelete(trash);

                if (reason === 'cancel') return message.channel.send({ embeds: [ package.embeds.cancel() ] });
                if (reason === 'ended') {
                    channel.messages.fetch().then((fetched) => {
                        const msg = fetched.find(x => x.id === message_id);
                        if (!msg) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                            .setTitle("Erreur")
                            .setColor('#ff0000')
                            .setDescription(`je ne trouve pas le message`)
                        ] });

                        if (!msg.reactions.cache.find(x => x.emoji.identifier === emoji.identifier)) return message.channel.send({ embeds: [ package.embeds.classic(message.author) 
                            .setTitle("Pas de réaction")
                            .setDescription(`Ce message n'a pas de réaction ${emoji}`)
                            .setColor('#ff0000')
                        ] })

                        client.db.query(`DELETE FROM rolesreact WHERE message_id="${msg.id}" AND emoji="${emoji.identifier}" AND guild_id="${message.guild.id}"`, (err, req) => {
                            if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

                            msg.reactions.cache.find(x => x.emoji.identifier === emoji.identifier).remove().catch(() => console.log);

                            message.channel.send({ embeds: [ package.embeds.classic(message.author)
                                .setTitle("Rôle à réaction")
                                .setDescription(`La réaction ${emoji} a été supprimée dans le salon <#${channel.id}>, au message d'id \`${message_id}\``)
                                .setColor('ORANGE')
                            ] });
                        });
                    });
                };
            });
        });
    }
};