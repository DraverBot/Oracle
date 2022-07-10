const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: "cmdpersonnalisée",
        description: "Gère les commandes personnalisées",
        options: [
            {
                name: "créer",
                description: "Créer une commande personnalisée",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "nom",
                        description: "Nom de la commande",
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: "réponse",
                        description: "Réponse du bot",
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: "supprimer",
                description: "Supprime une commande personnalisée",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "nom",
                        description: "Nom de la commande",
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'liste',
                description: "Affiche la liste des commandes personnalisées",
                type: 'SUB_COMMAND'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Cette commande n'est disponible que sur un serveur" });
        if (!interaction.member.permissions.has("MANAGE_GUILD")) return interaction.reply({ content: "Vous n'avez pas la permission `Gérer le serveur`" });

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'créer') {
            const name = interaction.options.get("nom").value;
            const reply = interaction.options.get('réponse').value;

            const commands = require('../assets/data/commands.json');
            const text = reply;
            let test;
    
            Object.keys(commands).forEach((key) => {
                let cmd = commands[key].find((x) => x.help.name === name.toLowerCase() || ( x.help.aliases && x.help.aliases.includes(name.toLowerCase()) ));
                if (cmd) test = cmd;
            });
    
            if (test) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Commande existante")
                .setDescription(`Oops, une commande de ce nom existe déjà.`)
                .setColor('#ff0000')
            ] });
    
            if (!text) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Pas de texte")
                .setDescription(`Oops, vous n'avez pas saisi de réponse`)
                .setColor('#ff0000')
            ] });
    
            if (text.includes('"') || name.includes('"')) return interaction.reply({ embeds: [ package.embeds.guillement(interaction.user) ] });
    
            client.db.query(`SELECT name FROM customs WHERE guild_id="${interaction.guild.id}" AND name="${name.toLowerCase()}"`, (err, req) => {
                if (err) return interaction({ embeds: [ package.embeds.errorSQL(interaction.user) ] });

                let sql = req.length === 0 ? `INSERT INTO customs (guild_id, name, text) VALUES ("${message.guild.id}", "${name}", "${text}")` : `UPDATE customs SET text="${text}" WHERE name="${name}" AND guild_id="${message.guild.id}"`;

                client.db.query(sql, (error, request) => {
                    if (error) {
                        interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
                        return console.log(error);
                    };
    
                    interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Commande personnalisée")
                        .setDescription(`J'ai **${sql.startsWith('INSERT') ? "crée" : "modifié"}** la commande \`${text}\``)
                        .setColor('ORANGE')
                    ] });
                });
            });
        } else if (subcommand === 'supprimer') {
            const name = interaction.options.get('nom').value;
    
            client.db.query(`SELECT name FROM customs WHERE guild_id="${interaction.guild.id}" AND name="${name.toLowerCase()}"`, (err, req) => {
                if (err) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
    
                if (req.length === 0) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Pas de commandes")
                    .setColor('#ff0000')
                    .setDescription(`Cette commande n'existe pas`)
                ] });
    
                client.db.query(`DELETE FROM customs WHERE guild_id="${interaction.guild.id}" AND name="${name}"`, (error) => {
                    if (error) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
    
                    interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Suppression de commande")
                        .setDescription(`J'ai supprimé la commande \`${name}\``)
                        .setColor('ORANGE')
                    ] });
                });
            });
        } else {
            client.db.query(`SELECT * FROM name WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                if (err) {
                    console.log(err);
                    return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
                };
        
                if (req.length === 0) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Pas de commandes")
                    .setDescription(`Il n'y a aucune commande personnalisées sur ce serveur.`)
                    .setColor('#ff0000')
                ] });
        
                if (req.length > 7) {
                    let now = package.embeds.classic(interaction.user)
                        .setTitle("Commandes")
                        .setDescription(`Voici la liste des commandes de ${interaction.guild.name}.`)
                        .setColor('ORANGE')
                    
                    var embeds = [];
                    let pile = false;
                    let count = 0;
                    
                    for (let i = 0; i < req.length; i++) {
                        const warn = req[i];
                        
                        now.addField(`Commande`, `\`${warn.name}\``, false);
        
                        pile = false;
        
                        count++;
                        if (count === 5) {
                            count=0;
                            pile = true;
                            embeds.push(now);
        
                            now = null;
                            now = package.embeds.classic(interaction.user)
                                .setTitle("Commandes")
                                .setDescription(`Voici la liste des commandes de ${interaction.guild.name}.`)
                                .setColor('ORANGE')
                        }
                    };
        
                    if (!pile) embeds.push(now);
                    
                    interaction.reply({ content: "Voici la liste des commandes personnalisées" }).then((x) => {
                        interaction.deleteReply().catch(() => {});
                    });
                    functions.pagination(interaction.user, interaction.channel, embeds, `commandes personnalisées`);
                };
            });
        };
    }
};