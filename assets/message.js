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
            const lowerContent = message.content.toLowerCase();
            if (!lowerContent.startsWith(prefix)) return;

            var args = message.content.trim().slice(prefix.length).split(' ');
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
    
                    suite();
                });
            };
            if (message.guild) {
                next();
            } else {
                next();
            }
        };
        let prefix = require('./data/data.json').default_prefix;

        if (message.guild) {
            client.db.query(`SELECT prefix FROM prefixes WHERE guild_id = "${message.guild.id}"`, (err, req) => {
                if (err) return console.log(err);
                prefix = req[0]?.prefix ?? require('./data/data.json').default_prefix;

                run(prefix);
            });
        } else {
            run(prefix);
        }
    }
}