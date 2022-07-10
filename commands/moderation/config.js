const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'set',
    aliases: ['config', 'configs', 'settings', 'configssettings'],
    description: 'Configure les différents paramètres modifiables',
    permissions: ['manage_guild'],
    private: false,
    dm: false,
    cooldown: 10
};

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports.run = (message, args, client, prefix) => {
    const params = [
        'logs_enable',// 0
        'join_enable',// 1
        'leave_enable',// 2
        'join_message',// 3
        'leave_message',// 4
        'join_channel',// 5
        'leave_channel',// 6
        'logs_channel',// 7
        'level_channel',//8
        'level_message', //9
        'level_enable', //10
        'interchat_enable', //11
        'interchat_channel', //12
        'roles_enable', //13
        'gban_enable', // 14
        'counting_enable', //15
        'counting_channel' // 16
    ]

    const correspondance = {
        joinmsg: 3,
        leavemsg: 4,
        logs: 0,
        logschannel: 7,
        joinchannel: 5,
        leavechannel: 6,
        joinactive: 1,
        leaveactive: 2,
        levelactive: 10,
        levelchannel: 8,
        levelmsg: 9,
        interchatactive: 11,
        interchatchannel: 12,
        rolesdarrivee:13,
        gbanactive: 14,
        countingactive: 15,
        countingchannel: 16
    };

    const types = {
        0: 'boolean',
        1: 'boolean',
        2: 'boolean',
        3: 'text',
        4: 'text',
        5: 'channel',
        6: 'channel',
        7: 'channel',
        8: 'channel',
        9: 'text',
        10: 'boolean',
        11: 'boolean',
        12: 'channel',
        13: 'boolean',
        14: 'boolean',
        15: 'boolean',
        16: 'channel'
    };

    const menu = package.embeds.classic(message.author)
        .setTitle("Menu")
        .setDescription(`Vous pouvez faire la liste d'actions ci-dessous en envoyant le message dans le chat :\n\n
\`leavemsg\` : modifier le message d'aurevoir.
\`joinmsg\` : modifier le message de bienvenue.
\`logs\` : activer/désactiver les logs.
\`logschannel\` : définir le salon des logs.
\`joinchannel\` : définir le salon de bienvenue.
\`leavechannel\` : définir le salon d'aurevoir.
\`joinactive\` : activer/désactiver le message de bienvenue.
\`leaveactive\` : activer/désactiver le message d'aurevoir.
\`levelactive\` : Activer/désactiver les niveaux.
\`levelchannel\` : Configurer le salon des niveaux.
\`levelmsg\` : définir le message de niveaux.
\`interchatactive\` : active/désactive l'interchat.
\`interchatchannel\` : configure le salon d'interchat.
\`rolesdarrivee\` : Active/désactive les rôles d'arrivées.
\`gbanactive\` : Active/désactive le système de GBan
\`countingactive\` : Active/désactive le système de compteur
\`coutingchannel\` : Définit le salon du compteur


Vous pouvez répondre par \`cancel\` pour annuler.\nVous disposez de deux minutes pour répondre`)
        .setColor('ORANGE')

    message.channel.send({ embeds: [ menu ] }).then((msg) => {
        let selected = false;
        let index = null;

        const filter = x => x.author.id === message.author.id;
        const collector = message.channel.createMessageCollector({ filter: filter, time: 120000, });

        var trash = [msg, message];

        collector.on('collect', (x) => {
                        trash.push(x);

            if (x.content.toLowerCase() === 'cancel') return collector.stop('cancel');

            if (!selected) {
                if (correspondance[x.toString()] > -1) {
                    index = correspondance[x];
                    selected = true;

                    message.channel.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle("Selectionné")
                        .setColor('ORANGE')
                        .setDescription(`J'ai sélectionné le paramètre que vous avez choisis.\n\nEnvoyez la valeur du nouveau paramètre, c'est un paramètre de type ${types[index] == 'boolean' ? "oui/non" : types[index] == 'text' ? `texte, pour rappel, voici les différentes valeurs que vous pouvez insérer :\n
\`{user.name}\` : le nom de l'utilisateur
\`{user.tag}\` : le tag de l'utilisateur (jaimeleschats#0001)
\`{user.id}\` : l'identifiant de l'utilisateur
\`{guild.name}\` : le nom du serveur ( ici, ${message.guild.name} )
\`{guild.count}\` : le nombre de membres dans le serveur
\`{user.mention}\` : la mention du membre
\`{user.level}\` : Le niveau du membre si c'est pour les niveaux

:warning: Je ne prend pas en compte les \`"\` pour des raisons de sécurité.
                        ` : ''}`)
                    ] }).then((y) => trash.push(y))
                }
            } else {
                if (types[index] == 'channel') {
                    let channel = message.guild.channels.cache.get(x.content) || x.mentions.channels.first();
                    if (!channel) return message.channel.send({ embeds: [ package.embeds.noChannel(message.author) ] });

                    client.db.query(`UPDATE configs SET ${params[index]}="${channel.id}" WHERE guild_id="${message.guild.id}"`, (err, req) => {
                        if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] }) & console.log(err);
                    })

                    message.channel.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle(package.emojis.gsyes + "Enregistré")
                        .setDescription(`J'ai enregistré le paramètre sur le salon <#${channel.id}>`)
                        .setColor('GREEN')
                    ] }).then((y) => trash.push(y))

                    collector.stop('ended')
                } else if (types[index] == 'boolean') {
                    let choice = x.content.toLowerCase();
                    const reply = package.embeds.classic(message.author)
                        .setTitle("Erreur")
                        .setDescription(`Impossible de déterminer ce que vous avez dit, veuillez répondre par \`oui\` ou par \`non\``)
                        .setColor('RED')

                    if (!choice) return message.channel.send({ embeds: [ reply ] }).then((y) => trash.push(y))
                    if (choice != 'oui' && choice != 'non') return message.channel.send({ embeds: [ reply ] }).then((y) => trash.push(y))

                    let choosen = choice == 'oui' ? '1':'0';

                    client.db.query(`UPDATE configs SET ${params[index]}="${choosen}" WHERE guild_id="${message.guild.id}"`, (err, req) => {
                        if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] }) & console.log(err);
                    });
                    
                    message.channel.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle(package.emojis.gsyes + "Enregistré")
                        .setDescription(`J'ai enregistré le paramètre sur \`${choosen == 1 ? 'Oui' : 'Non'}\``)
                        .setColor('GREEN')
                    ] }).then((y) => trash.push(y))

                    collector.stop('ended')
                } else {
                    let text = x.content;
                    if (!text) return message.channel.send({ embeds: [ package.embeds.noText(message.author) ] }).then((y) => trash.push(y));
                    if (text.includes('"')) return message.channel.send({ embeds: [ functions.package().embeds.classic(message.author)
                        .setTitle("Impossible")
                        .setDescription(`Oops, je ne peux pas prendre de \`"\` dans les textes, pour des raisons de sécurité.`)
                        .setColor('#ff0000')
                    ] });
                    
                    client.db.query(`UPDATE configs SET ${params[index]}="${text}" WHERE guild_id="${message.guild.id}"`, (err, req) => {
                        if (err) message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] }) & console.log(err);
                    });

                    message.channel.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle(package.emojis.gsyes + "Enregistré")
                        .setDescription(`J'ai enregistré le texte sur \`\`\`${text}\`\`\``)
                        .setColor('GREEN')
                    ] }).then((y) => trash.push(y));

                    collector.stop('ended');
                };
            };
        });

        collector.on('end', (collected, reason) => {
            trash.forEach((x) => {
                x.delete().catch(() => {});
            });

            if (!collected.size) return message.channel.send({ embeds: [ package.embeds.collectorNoMessage(message.author) ] });
            if (reason === 'cancel') return message.channel.send({ embeds: [ package.embeds.cancel() ] });
        });
    });
};