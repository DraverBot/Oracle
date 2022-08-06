const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions:[],
        systems: [{name: "d'économie", value: 'economy_enable', state: true}],
        dm: false,
        dev: false
    },
    configs: {
        name: 'magasin',
        description: "Utilisez le système de magasin",
        options: [
            {
                name: 'item',
                type: 'SUB_COMMAND_GROUP',
                description: "Ajoute des items au magasin",
                options: [
                    {
                        name: 'ajouter',
                        type: 'SUB_COMMAND',
                        description: "Ajouter un item au magasin",
                        options:[
                            {
                                name: 'nom',
                                description: "Nom de l'item",
                                type: 'STRING',
                                required: true
                            },
                            {
                                name: 'type',
                                description: "Type de l'item",
                                type: 'STRING',
                                required: true,
                                choices: [
                                    {
                                        name: 'Rôle',
                                        value: 'role'
                                    },
                                    {
                                        name: 'Étiquette',
                                        value: 'text'
                                    }
                                ]
                            },
                            {
                                name: 'prix',
                                description: "Prix de l'item",
                                type: 'INTEGER',
                                required: true
                            },
                            {
                                name: 'quantité',
                                description: "Nombre d'items que vous voulez ajouter (laissez vide pour illimité)",
                                type: 'INTEGER',
                                required: false
                            },
                            {
                                name: 'description',
                                description: "Description de l'étiquette (si étiquette)",
                                type: 'STRING',
                                required: false
                            },
                            {
                                name: 'role',
                                description: "Rôle (si l'item est un rôle)",
                                type: 'ROLE',
                                required: false
                            }
                        ]
                    },
                    {
                        name: 'supprimer',
                        description: "Supprime un item du magasin",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: "identifiant",
                                description: "Identifiant de l'item à supprimer",
                                type: 'STRING',
                                required: true
                            }
                        ]
                    }
                ]
            },
            {
                name: 'view',
                description: "Affiche le magasin",
                type: 'SUB_COMMAND'
            },
            {
                name: 'acheter',
                description: "Achète un item du shop",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'identifiant',
                        type: 'STRING',
                        description: "Identifiant de l'item à acheter",
                        required: true
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    run: async(interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand == "ajouter") {
            if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, "gérer le serveur") ] }).catch(() => {});

            let name = interaction.options.getString('nom');
            let type = interaction.options.getString('type');
            let price = interaction.options.get('prix').value;
            let quantity = interaction.options.get("quantité")?.value ?? 0;
            let description = interaction.options.getString('description');
            let role = interaction.options.getRole('role');
            
            if (quantity < 0) quantity = 0;
            if (type == 'role' && !role) return interaction.reply({ embeds: [ package.embeds.noRole(interaction.user) ] }).catch(() => {});
            if (type == 'text' && !description) return interaction.reply({ embeds: [ package.embeds.noText(interaction.user) ] }).catch(() => {});
            if ((description && description.includes('"')) || name.includes('"')) return interaction.reply({ embeds: [ package.embeds.guillement(interaction.user) ] }).catch(() => {});
            if (price < 0) price = parseInt(price.toString().slice(1));
            price = price.toFixed(0);

            if (role && role.position > interaction.member.roles.highest.position) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Rôle trop haut")
                .setDescription(`Ce rôle est trop haut pour vous.`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            let sql = `INSERT INTO shop (guild_id, item_name, item_type, quantity, extra, price) VALUES ("${interaction.guild.id}", "${name}", "${type}", "${quantity}", '{${type == 'role' ? `"id": "${role.id}"` : `"text": "${description}"`}}", "${price}")`;
            interaction.client.db.query(sql, (err, req) => {
                if (err) {
                    interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    functions.sendError(err, 'query add at /shop item ajouter', interaction.user);
                    return;
                };

                interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Item ajouté")
                    .setDescription(`L'item ${name} a été ajouté au magasin pour **${price.toLocaleString('en').replace(/,/g, ' ')}** ${package.configs.coins}`)
                    .setColor('ORANGE')
                ] }).catch(() => {});
            })
        };
        if (subcommand == 'supprimer') {
            if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, "gérer le serveur") ] }).catch(() => {});

            let id = interaction.options.getString('identifiant');
            await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] }).catch(() => {});
            interaction.client.db.query(`SELECT item_name FROM shop WHERE id="${id}" AND guild_id="${interaction.guild.id}"`, (err, req) => {
                if (err) {
                    interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    functions.sendError(err, 'query fetch at /shop item supprimer', interaction.user);
                    return;
                };

                if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Item inexistant")
                    .setDescription(`L'item d'id \`${id}\` n'existe pas dans ${interaction.guild.name}.`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                interaction.client.db.query(`DELETE FROM shop WHERE id="${id}"`, (er) => {
                    if (er) {
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                        functions.sendError(er, 'query delete at /shop item supprimer', interaction.user);
                        return;
                    };

                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Item supprimé")
                        .setDescription(`L'item \`${req[0].item_name}\` a été retiré du magasin`)
                        .setColor(interaction.guild.me.displayHexColor)
                    ] }).catch(() => {});
                });
            });
        };
        if (subcommand == 'view') {
            await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Patientez")
                .setDescription(`Veuillez patienter le temps que j'installe le magasin`)
                .setColor('ORANGE')
            ] }).catch(() => {});

            interaction.client.db.query(`SELECT * FROM shop WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                if (err) {
                    interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    functions.sendError(err, 'query add at /shop view', interaction.user);
                    return;
                };

                if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Magasin vide")
                    .setDescription(`Il n'y a rien dans le magasin.\nUtilisez la commande \`/shop item ajouter\` pour créer un item`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                const embed = package.embeds.classic(interaction.user)
                    .setTitle("Magasin")
                    .setDescription(`Voici le magasin de ${interaction.guild.name}`)
                    .setColor(interaction.guild.me.displayHexColor)
                
                const addField = (data, embed, index) => {
                    let returned = index;
                    if (index == 3) {
                        returned = 0;
                        embed.addField('\u200b', '\u200b', false)
                    };

                    data.extra = JSON.parse(data.extra);
                    embed.addField(data.item_name, `${data.item_type == 'role' ? `<@&${data.extra.id}>` : data.extra.text}\n**Identifiant :** \`${data.id}\`\n> Prix : ${parseInt(data.price).toLocaleString('en').replace(/,/g, ' ')} ${package.configs.coins}\nEn stock : ${parseInt(data.quantity) == 0 ? "illimité" : `${data.quantity} restant(s)`}`, true);
                    return returned + 1;
                };

                let i = 0;
                for (const data of req) {
                    i = addField(data, embed, i);
                };

                interaction.editReply({ embeds: [ embed ] }).catch(() => {});
            });
        };
    }
};