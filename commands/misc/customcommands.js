const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'customcommand',
    description: "Gère les commandes personnalisées",
    private: false,
    dm: false,
    aliases: ['cc'],
    permissions: ['manage_guild'],
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    const subCommand = (args.shift() || 'help').toLowerCase();

    if (subCommand === 'list') {
        client.db.query(`SELECT * FROM customs WHERE guild_id="${message.guild.id}"`, (err, req) => {
            if (err) {
                console.log(err);
                return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
            };
    
            if (req.length === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Pas de commandes")
                .setDescription(`Il n'y a aucune commande personnalisées sur ce serveur.`)
                .setColor('#ff0000')
            ] });
    
            if (req.length > 7) {
                let now = package.embeds.classic(message.author)
                    .setTitle("Commandes")
                    .setDescription(`Voici la liste des commandes de ${message.guild.name}.`)
                    .setColor('ORANGE')
                
                var embeds = [];
                let pile = false;
                let count = 0;
                
                for (let i = 0; i < req.length; i++) {
                    const warn = req[i];
                    
                    now.addField(`Commande`, `\`${prefix}${warn.name}\``, false);
    
                    pile = false;
    
                    count++;
                    if (count === 5) {
                        count=0;
                        pile = true;
                        embeds.push(now);
    
                        now = null;
                        now = package.embeds.classic(message.author)
                            .setTitle("Commandes")
                            .setDescription(`Voici la liste des commandes de ${message.guild.name}.`)
                            .setColor('ORANGE')
                    }
                };
    
                if (!pile) embeds.push(now);
                
                functions.pagination(message.author, message.channel, embeds, `commandes personnalisées`);
            } else {
                const embed = package.embeds.classic(message.author)
                    .setTitle("Commandes")
                    .setDescription(`Voici la liste des commandes de ${message.guild.name}.`)
                    .setColor('ORANGE')
    
                req.forEach((warn) => {
                    embed.addField(`Commande`, `\`${prefix}${warn.name}\``, false);
                });
    
                message.channel.send({ embeds: [ embed ] });
            }
        });
    } else if (subCommand === 'delete') {
        const name = args.shift();
        if (!name) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Pas de nom")
            .setDescription(`Oops, vous n'avez pas saisi de nom de commande`)
            .setColor('#ff0000')
        ] });

        client.db.query(`SELECT * FROM customs WHERE guild_id="${message.guild.id}" AND name="${name.toLowerCase()}"`, (err, req) => {
            if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

            if (req.length === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Pas de commandes")
                .setColor('#ff0000')
                .setDescription(`Cette commande n'existe pas`)
            ] });

            client.db.query(`DELETE FROM customs WHERE guild_id="${message.guild.id}" AND name="${name}"`, (error) => {
                if (error) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Suppression de commande")
                    .setDescription(`J'ai supprimé la commande \`${name}\``)
                    .setColor('ORANGE')
                ] });
            });
        });
    } else if (subCommand === 'set') {
        const name = args.shift();
        if (!name) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Pas de nom")
            .setDescription(`Oops, vous n'avez pas spécifié de nom de commande`)
            .setColor('#ff0000')
        ] });

        const commands = require('../../assets/data/commands.json');
        let test;

        Object.keys(commands).forEach((key) => {
            let cmd = commands[key].find((x) => x.help.name === name.toLowerCase() || ( x.help.aliases && x.help.aliases.includes(name.toLowerCase()) ));
            if (cmd) test = cmd;
        });

        if (test) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Commande existante")
            .setDescription(`Oops, une commande de ce nom existe déjà.`)
            .setColor('#ff0000')
        ] });

        const text = args.join(' ');
        if (!text) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Pas de texte")
            .setDescription(`Oops, vous n'avez pas saisi de réponse`)
            .setColor('#ff0000')
        ] });

        if (text.includes('"') || name.includes('"')) return message.channel.send({ embeds: [ package.embeds.guillement(message.author) ] });

        client.db.query(`SELECT * FROM customs WHERE guild_id="${message.guild.id}" AND name="${name.toLowerCase()}"`, (err, req) => {
            if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

            let sql = req.length === 0 ? `INSERT INTO customs (guild_id, name, text) VALUES ("${message.guild.id}", "${name}", "${text}")` : `UPDATE customs SET text="${text}" WHERE name="${name}" AND guild_id="${message.guild.id}"`;
            client.db.query(sql, (error, request) => {
                if (error) {
                    message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
                    return console.log(error);
                };

                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Commande personnalisée")
                    .setDescription(`J'ai **${sql.startsWith('INSERT') ? "crée" : "modifié"}** la commande \`${text}\``)
                    .setColor('ORANGE')
                ] });
            })
        })
    } else {
        const embed = package.embeds.classic(message.author)
            .setTitle("Page d'aide")
            .setDescription(`Commande \`${prefix}customcommands\`
Alias: \`${prefix}cc\`

Sous-commandes: \`help\`, \`list\`, \`set\`, \`delete\``)
            .setColor('ORANGE')
        
        message.channel.send({ embeds: [ embed ] });
    };
};