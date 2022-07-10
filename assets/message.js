const Discord = require('discord.js');
const functions = require('./functions.js');
const package = functions.package();

module.exports = {
    /**
     * @param {Discord.Message} message 
     */
    run: (message) => {
        if (package.configs.beta && message.author.id !== package.configs.gs) return;

        const { client } = require('../index');
        if (message.author.bot || message.webhookId) return;

        if (message.guild) {
            client.db.query(`SELECT guild_id FROM configs WHERE guild_id="${message.guild.id}"`, (err,req) => {
                if (err) return console.log(err);
                if (req.length !== 0) return;
    
                client.db.query(`INSERT INTO configs (guild_id) VALUES ("${message.guild.id}")`, (e, r) => {
                    if (e) console.log(e);
                });
            });
        };


        const run = (prefix) => {
            if (message.mentions.users.has(client.user.id) && !message.mentions.everyone) {
                let splashes = require('./data/splash.json').filter(x => !x.includes('weird'));

                if (!functions.random(200, 0) === 132) {
                    const index = splashes.indexOf(x => x === 'This is an easter egg !');
                    splashes.splice(index, 1);
                };
                let size = require('./data/splash.json').length;
                
                let splash = splashes[functions.random(splashes.length, 0)].replace('{username}', message.author.username);
                splash.replace('{size}', size);

                const reponse = package.embeds.classic(message.author)
                    .setTitle(splash)
                    .setDescription(`Bonjour ! Mon préfixe sur ce serveur est \`${prefix}\` !\n\nFaites \`${prefix}help\` pour obtenir de l'aide.\n\n:bulb: <@${client.user.id}> est désormais disponible en slash commands !\n> Si vous ne voyez pas mes slash commands, réinvitez moi par le lien de la commande \`${prefix}invite\`.`)
                    .setColor(message.guild.me.displayHexColor)
                    .setAuthor({ name: message.guild ? message.guild.me.nickname ? message.guild.me.nickname :'Oracle' : "Oracle", iconURL: message.author.displayAvatarURL({ dynamic: true }) })

                if (splash === "Click on the link") {
                    reponse.setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                }; 
                
                functions.reply(message, reponse);

                if (message.guild) {
                    if (functions.random(10000, 0) === 794) {
                        message.guild.me.setNickname(`Oralce`);
                    };
                    if ((message.guild.me.nickname === 'Dinnerbone' || message.guild.me.nickname === 'Grumm') && functions.random(10, 0) === 5) {
                        const reverse = (text) => {
                            let t ="";
                            for (let i =0;i<text.length;i++) {
                                t = text[i] + t;
                            };
        
                            return t;
                        }
                        message.channel.send({ content: reverse(`C'est le monde à l'envers !`) })
                    }
                }
            };

            const lowerContent = message.content.toLowerCase();
            if (!lowerContent.startsWith(prefix) && !lowerContent.startsWith("gs")) return;

            var args = message.content.trim().slice(lowerContent.startsWith('gs') ? 2 : prefix.length).split(' ');
            const commandName = args.shift().toLowerCase();

            const next = () => {
                const commands = require('./data/commands.json');
    
                let command;
                Object.keys(commands).forEach((categorie) => {
                    const array = commands[categorie];
    
                    if (array.filter((x) => (x.name === commandName || (x.help.aliases && x.help.aliases.includes(commandName)))).length != 0) {
                        command = array.find(x => (x.name === commandName || (x.help.aliases && x.help.aliases.includes(commandName))));
                    };
                });
    
                if (!command) return;
    
                const file = require(`../${command.path}`);
    
                const { gs, yz } = require('./data/data.json');
                if (file.help.private && ![gs, yz].includes(message.author.id)) return;
    
                if (!file.help.dm && !message.guild) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Commande inexécutable")
                    .setDescription(`Oops, vous avez essayé d'utiliser une commande qui ne peut s'exécuter que sur un serveur.`)
                    .setColor('#ff0000')
                ] });
    
                let canGo = true;
                file.help.permissions.forEach((permission) => {
                    if (!message.member.permissions.has(permission.toUpperCase())) canGo = false;
                });
    
                if (!canGo) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Permissions insuffisantes")
                    .setDescription(`Oops, vous n'avez pas les permissions nécéssaires pour exécuter cette commande`)
                    .setColor('#ff0000')
                ] });
    
                const suite = () => {
                    const execute = new Promise((resolve, reject) => resolve(file.run(message, args, client, prefix)));
                    execute.catch((error) => {
                        console.log(error);
                        const { errorChannel } = require('./data/data.json');
                    
                        message.channel.send({ embeds: [ package.embeds.classic(message.author)
                            .setTitle("Erreur")
                            .setDescription(`Oops, vous avez rencontré une erreur.\nVous n'êtes pas censé voir ce message.\nRéessayez la commande en vérifiant les paramètres de cette dernière.\nSi l'erreur persiste, signalez-là à mon développeur via la commande \`${prefix}report\``)
                            .setColor('#ff0000')
                        ] });
    
                        functions.sendError(error, commandName, message.author);
                    });
                };
    
                client.db.query(`SELECT * FROM cooldowns WHERE guild_id="${message.guild.id}" AND user_id="${message.author.id}" AND command="${file.name}"`, (err, req) => {
                    let go = true;
                    if (err) {
                        console.log(err);
                        return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
                    };
    
                    if (req.length === 0) {
                        client.db.query(`INSERT INTO cooldowns (guild_id, user_id, command, date) VALUES ("${message.guild.id}", "${message.author.id}", "${file.name}", "${Date.now() + file.help.cooldown * 1000}")`, (error) => {
                            if (error) go = false;
                            if (error) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] })  & console.log(error);
                        });
                    } else {
                        if (parseInt(req[0].date) > Date.now()) {
                            const moment = require('moment');
                            moment.locale('fr');
    
                            return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                                .setTitle('Cooldown')
                                .setDescription(`Oops, vous avez un cooldown sur cette commande, réessayez ${moment(req[0].date)}`)
                                .setColor('#ff0000')
                            ] });
                        } else {
                            client.db.query(`INSERT INTO cooldowns (guild_id, user_id, command, date) VALUES ("${message.guild.id}", "${message.author.id}", "${file.name}", "${Date.now() + file.help.cooldown * 1000}")`, (error) => {
                                if (error) go =false & console.log(error);
                                if (error) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
                            });
                        }
                    };
                    if (!go) return;
    
                    suite();
                })

            };
            if (message.guild) {
                client.db.query(`SELECT * FROM customs WHERE guild_id="${message.guild.id}" AND name="${commandName}"`, (error, request) => {
                    if (error) {
                        console.log(error);
                        message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
                        return;
                    }
    
                   if (request.length === 0) return next();

                   let original = request[0].text;

                   let response = original;
                    function replace(x, y) {
                        const regex = new RegExp(`{${x}}`, 'g');

                        response = response.replace(regex, y);
                    };

                    const corres = [
                        {x: 'user.name', y: message.author.username},
                        {x: 'user.tag', y: message.author.discriminator},
                        {x: 'user.mention', y: `<@${message.author.id}>`},
                        {x: 'user.id', y: message.author.id},
                        {x: "del", y: ' '},
                        {x: "args", y: args.join(' ') ? args.join(' ') : 'missingno'},
                        {x: 'guild.name', y: message.guild.name},
                        {x: 'guild.count', y: message.guild.members.cache.size},
                        {x: 'reply', y: ' '},
                        {x: 'mp', y: ' '}
                    ];
                    corres.forEach((x) => {replace(x.x, x.y)});

                    let line = false;

                    if (original.includes('{del}')) message.delete().catch(() => {});
                    if (original.includes('{reply}')) line = true;

                    if (original.includes('{mp}')) {
                        message.author.send({ content: response }).catch(() => {});
                    } else {        
                        if (line) return functions.lineReply(message.id, message.channel, response, false);
                        return message.channel.send({ content: response });
                    }
                });
            } else {
                next();
            }
        };
        let prefix = require('./data/data.json').default_prefix;

        if (message.guild) {
            client.db.query(`SELECT prefix FROM prefixes WHERE guild_id = "${message.guild.id}"`, (err, req) => {
                if (err) return console.log(err);
                prefix = req[0] ? req[0].prefix : require('./data/data.json').default_prefix;

                run(prefix);
            });
        } else {
            run(prefix);
        }
    }
}