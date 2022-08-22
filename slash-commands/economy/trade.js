const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions: [],
        systems: [],
        dm: false,
        dev: false
    },
    configs: {
        name: "échange",
        description: "Effectue un échange",
        options: [
            {
                name: "utilisateur",
                description: "Utilisateur avec qui vous voulez échanger",
                type: 'USER',
                required: true
            },
            {
                name: "item",
                type: 'STRING',
                required: true,
                description: "Nom de l'item que vous voulez échanger"
            },
            {
                name: "prix", 
                type: 'INTEGER',
                required: true,
                description: "Prix auxquel vous souhaitez échanger"
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let user = interaction.options.getUser('utilisateur');
        let itemName = interaction.options.getString('item');
        let price = parseInt(interaction.options.get('prix').value);

        if (user.bot || user.id == interaction.user.id) return interaction.reply({ embeds: [ package.embeds.noUser(interaction.user) ] }).catch(() => {});
        if (price < 0) price = parseInt(price.toString().slice(1));

        if (isNaN(price)) return interaction.reply({ embeds: [ package.embeds.invalidNumber(interaction.user) ] }).catch(() => {});
        interaction.client.db.query(`SELECT * FROM inventory WHERE item_name="${itemName}" AND guild_id="${interaction.guild.id}" AND user_id="${interaction.user.id}"`, async(err, req) => {
            if (err) {
                functions.sendError(err, 'query fetch at /échange', interaction.user);
                interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                return;
            };

            if (req.length == 0) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Item introuvable")
                .setDescription(`Je n'ai pas trouvé d'item dans votre inventaire avec le nom \`${itemName}\`.\nVérifiez que le nom saisi est **exactement** le même que celui dans votre inventaire`)
                .setColor('#ff0000')
            ] }).catch(() => {});
            const item = req[0];

            let id = interaction.user.id;
            await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Confirmation de l'échange")
                .setDescription(`Confirmez-vous que vous donnez **${itemName}** à <@${user.id}> en échange de **${price.toLocaleString('fr-DE')}** ${package.configs.coins} ?`)
                .setColor('YELLOW')
            ], components: [ new Discord.ActionRowBuilder()
                .addComponents(new Discord.ButtonBuilder({ label: 'Oui', style: Discord.ButtonStyle.Success, customId: 'y' }), new Discord.ButtonBuilder({ label: 'Non', style: Discord.ButtonStyle.Danger, customId: 'n' }))
            ], content: `<@${id}>` }).catch(() => {});

            const msg = await interaction.fetchReply();
            const collector = msg.createMessageComponentCollector({ filter: x => x.user.id == x.user.id, time: 120000 });

            collector.on('collect', /** @param {Discord.ButtonInteraction} inter*/ async(inter) => {
                await inter.deferUpdate();
                if (inter.user.id == id) {
                    if (inter.customId == 'n') return collector.stop('cancel');
                    if (id == interaction.user.id) {
                        collector.resetTimer();
                        id = user.id;
                        await interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                            .setTitle("Confirmation de l'échange")
                            .setDescription(`Confirmez-vous que vous donnez **${price.toLocaleString('fr-DE')}** ${package.configs.coins} à <@${interaction.user.id}> en échange de **${itemName}** ?`)
                            .setColor('YELLOW')
                        ], content: `<@${id}>` }).catch(() => {});
                    } else {
                        collector.stop('trade');
                    };
                };
            });

            const edit = async(embed) => {
                await interaction.editReply({ content: `<@${interaction.user.id}>`, components: [], embeds: [ embed ] }).catch((e) => {console.log(e)});
            };
            collector.on('end', (colected, reason) => {
                if (reason == 'trade') {
                    const result = interaction.client.CoinsManager.removeCoins({ user_id: user.id, guild_id: interaction.guild.id }, price);
                    if (result == false || result == 'not enough coins') return edit(package.embeds.notEnoughCoins(user));

                    interaction.client.db.query(`DELETE FROM inventory WHERE id="${item.id}" AND user_id="${interaction.user.id}"`, (error, request) => {
                        if (error) {
                            interaction.client.CoinsManager.addCoins({ user: user.id, guild_id: interaction.guild.id }, price);
                            edit(package.embeds.classic(interaction.user)
                                .setTitle("Erreur")
                                .setDescription(`Une erreur a eu lieu lors de l'échange.\nL'échange a été remboursé`)
                            );
                            functions.sendError(error, 'delete query in /trade', interaction.user);
                            console.log(error);
                            return;
                        };
                        console.log(request);
                        let sql = `INSERT INTO inventory (guild_id, user_id, item_name, item_type) VALUES ("${interaction.guild.id}", "${user.id}", "${item.item_name.replace(/\\'/g, "\\'")}", "${item.item_type}")`;
                        console.log(sql);
                        interaction.client.db.query(sql, (er, re) => {
                            if (er) {
                                interaction.client.CoinsManager.addCoins({ user: user.id, guild_id: interaction.guild.id }, price);
                                edit(package.embeds.classic(interaction.user)
                                    .setTitle("Erreur")
                                    .setDescription(`Une erreur a eu lieu lors de l'échange.\nL'échange a été remboursé`)
                                );
                                functions.sendError(er, 'insert query in /trade', interaction.user);
                                return;
                            };
                            console.log(re);    
                            interaction.client.CoinsManager.addCoins({ user_id: interaction.user.id, guild_id: interaction.guild.id }, price);

                            const trade = package.embeds.classic(interaction.user)
                                .setTitle("Échange")
                                .setDescription(`Un échange a eu lieu entre <@${user.id}> et <@${interaction.user.id}>`)
                                .setColor(interaction.guild.me.displayHexColor)
                                .addFields(
                                    {
                                        name: interaction.user.username,
                                        value: `A donné **${itemName} (x1)**\nA reçu **${price.toLocaleString('en').replace(/,/g, ' ')} ${package.configs.coins}**`,
                                        inline: true
                                    },
                                    {
                                        name: '\u200b',
                                        value: '→\n←',
                                        inline: true
                                    },
                                    {
                                        name: user.username,
                                        value: `A reçu **${itemName} (x1)**\nA donné **${price.toLocaleString('en').replace(/,/g, ' ')} ${package.configs.coins}**`,
                                        inline: true
                                    }
                                );
                            edit(trade);
                        });
                    });

                } else edit(package.embeds.cancel());
            })
        });
    }
}