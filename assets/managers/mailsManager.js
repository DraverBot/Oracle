const Discord = require('discord.js');
const functions = require('../functions');
const pack = functions.package();
const moment = require('moment');
const ms = require('ms');
const { Connection } = require('mysql');

moment.locale('fr');

class MailManager {
    /**
     * @param {Discord.Client} client 
     * @param {Connection} db 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
    }
    sendImportantMail(user, channel, content, object, sender) {
        this.db.query(`SELECT * FROM mails WHERE user_id="${user.id}" AND vu="0"`, (err, req) => {
            if (err) return channel.send({ embeds: [ pack.embeds.errorSQL(user) ] }) & console.log(err);

            if (req.length === 24) return channel.send({ content: `Cet utilisateur a atteint la limite de mails.` });
        })
        if (content.includes('"') || object.includes('"')) return channel.send({ embeds: [ pack.embeds.guillement(sender) ] });

        this.db.query(`INSERT INTO mails (user_id, sender_id, sender_name, sender_tag, sended_at, content, object, important) VALUES (
            "${user.id}",
            "${sender.id}",
            "${sender.username}",
            "${sender.discriminator}",
            "${Date.now()}",
            "${content}",
            "${object}",
            "${1}"
        )`, (err, req) => {
            if(err) return channel.send({ embeds: [ pack.embeds.errorSQL(sender) ] }) & console.log(err);
            channel.send({ embeds: [ pack.embeds.classic(user)
                .setTitle("Mail envoyé")
                .setDescription(`J'ai envoyé votre mail à <@${user.id}>`)
                .setColor("ORANGE")
            ] });
        });
    }
    /**
     * @param {Discord.User} user 
     * @param {Discord.TextChannel} channel 
     * @param {String} content 
     * @param {String} object 
     * @param {Discord.User} sender 
     * @param {Boolean}
     */
    send(user, channel, content, object, sender, important, send) {
        this.db.query(`SELECT * FROM mails WHERE user_id="${user.id}" AND vu="0"`, (err, req) => {
            if (err) return channel.send({ embeds: [ pack.embeds.errorSQL(user) ] }) & console.log(err);

            if (req.length === 24) return channel.send({ content: `Cet utilisateur a atteint la limite de mails.` });
        })
        if (content.includes('"') || object.includes('"')) return channel.send({ embeds: [ pack.embeds.guillement(sender) ] });

        this.db.query(`INSERT INTO mails (user_id, sender_id, sender_name, sender_tag, sended_at, content, object, important) VALUES (
            "${user.id}",
            "${sender.id}",
            "${sender.username}",
            "${sender.discriminator}",
            "${Date.now()}",
            "${content}",
            "${object}",
            "${important ? 1 : 0}"
        )`, (err, req) => {
            if(err) return channel.send({ embeds: [ pack.embeds.errorSQL(sender) ] }) & console.log(err);
            if (send == true) channel.send({ embeds: [ pack.embeds.classic(user)
                .setTitle("Mail envoyé")
                .setDescription(`J'ai envoyé votre mail à <@${user.id}>`)
                .setColor("ORANGE")
            ] });
        });
    }
    generateMailBoxButtons() {
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setLabel('Non-lus')
                .setStyle('SUCCESS')
                .setCustomId('noread'),
            new Discord.MessageButton()
                .setStyle('SECONDARY')
                .setLabel('Lus')
                .setCustomId('read'),
            new Discord.MessageButton()
                .setStyle('PRIMARY')
                .setLabel('Supprimer un mail')
                .setCustomId('delete')
                .setEmoji('🗑️')
            ,
            new Discord.MessageButton()
                .setStyle('DANGER')
                .setLabel('Annuler')
                .setCustomId('cancel')
        );

        return row;
    }
    /**
     * @param {Discord.User} user 
     * @param {Discord.TextChannel} channel 
     * @param {Discord.Message} message 
     */
    readMailsReaden(user, message, mails) { 
        const embed = pack.embeds.classic(user)
            .setTitle("Mails")
            .setDescription(`Choisissez un mail`)
            .setColor('ORANGE')

        const menu = new Discord.MessageSelectMenu()
            .setCustomId('selector')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Choisissez un mail")
        
        
        mails.forEach((mail) => {
            menu.addOptions([{
                label: mail.object,
                emoji: mail.important === 0 ? pack.emojis.notimportant : pack.emojis.important,
                description: `Envoyé le ${moment(parseInt(mail.sended_at)).format('DD/MM/YYYY | hh:mm')}`,
                value: mail.id.toString()
            }]);
        });

        menu.addOptions([
            {
                emoji: "❌",
                value: 'cancel',
                label: 'Fermer',
                description: "Fermer la boite mail"
            }
        ]);
        
        const row = new Discord.MessageActionRow()
            .addComponents(
                menu
            )

        message.edit({ embeds: [ embed ], components: [ row ] });
        const collector = message.createMessageComponentCollector({ filter: i => i.user.id === user.id, time: 60*1000*5 });

        collector.on('collect', /** @param {Discord.SelectMenuInteraction} interaction */ (interaction) => {
            if (interaction.values[0] === 'cancel') return collector.stop('cancel');

            const mail = mails.find(x => x.id === parseInt(interaction.values[0]));
            const mailEmbed = pack.embeds.classic(user)
                .setTitle("Boite mail")
                .setAuthor(mail.sender_name)
                .setDescription(`${mail.important === 0 ? pack.emojis.notimportant : pack.emojis.important} ${mail.object}\n\n\`\`\`${mail.content}\`\`\``)
                .setColor('ORANGE')

            message.edit({ embeds: [ mailEmbed ], components: [ row ] });

            interaction.reply({ content: `Mail reçu` }).catch(() => {
                interaction.editReply({ content: "Mail reçu" }).catch(() => {});
            })
        });
        collector.on('end', (collected, reason) => {
            if (reason === 'cancel') return message.edit({ embeds: [ pack.embeds.cancel() ], components: [] })
        });
    }
    generateCancelButton() {
        return {
            emoji: "❌",
            value: 'cancel',
            label: 'Fermer',
            description: "Fermer la boite mail"
        }
    }
    /**
     * @param {Discord.User} user 
     * @param {Discord.TextChannel} channel 
     * @param {Discord.Message} message 
     */
    readMailsNotRead(user, message, mails) {
        const embed = pack.embeds.classic(user)
            .setTitle("Mails")
            .setDescription(`Choisissez un mail`)
            .setColor('ORANGE')

        const menu = new Discord.MessageSelectMenu()
            .setCustomId('selector')
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder("Choisissez un mail")
        
        
        mails.forEach((mail) => {
            menu.addOptions([{
                label: mail.object,
                emoji: mail.important === 0 ? pack.emojis.notimportant : pack.emojis.important,
                description: `Envoyé le ${moment(parseInt(mail.sended_at)).format('DD/MM/YYYY | hh:mm')}`,
                value: mail.id.toString()
            }]);
        });

        menu.addOptions(this.generateCancelButton());
        
        const row = new Discord.MessageActionRow()
            .addComponents(
                menu
            )

        message.edit({ embeds: [ embed ], components: [ row ] });
        const collector = message.createMessageComponentCollector({ filter: i => i.user.id === user.id, time: 60*1000*5 });

        collector.on('collect', /** @param {Discord.SelectMenuInteraction} interaction */ (interaction) => {
            interaction.deferUpdate();
            if (interaction.values[0] === 'cancel') return collector.stop('cancel');

            const mail = mails.find(x => x.id === parseInt(interaction.values[0]));
            const mailEmbed = pack.embeds.classic(user)
                .setTitle("Boite mail")
                .setAuthor(mail.sender_name)
                .setDescription(`${mail.important === 0 ? pack.emojis.notimportant : pack.emojis.important} ${mail.object}\n\n\`\`\`${mail.content}\`\`\``)
                .setColor('ORANGE')

            message.edit({ embeds: [ mailEmbed ], components: [ row ] });

            this.db.query(`UPDATE mails SET vu="1" WHERE id="${mail.id}"`, (e) => e?console.log:null);
        });
        collector.on('end', (collected, reason) => {
            if (reason === 'cancel') return message.edit({ embeds: [ pack.embeds.cancel() ], components: [] })
        });
    }
    /**
     * 
     * @param {Discord.User} user 
     * @param {Discord.Message} message 
     */
    deleteMail(user, message, mails) {
        const menu = new Discord.MessageSelectMenu()
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder('Choisissez un mail')
            .setCustomId('selector')
            
        mails.forEach((mail) => {
            menu.addOptions([{
                label: mail.object,
                emoji: mail.important === 0 ? pack.emojis.notimportant : pack.emojis.important,
                description: `Envoyé le ${moment(parseInt(mail.sended_at)).format('DD/MM/YYYY | hh:mm')}`,
                value: mail.id.toString()
            }]);
        });

        menu.addOptions(this.generateCancelButton());

        const confirm = (mailId, mailObject, isImportant) => {
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setStyle('SUCCESS')
                        .setLabel('Valider')
                        .setCustomId('confirm'),
                    new Discord.MessageButton()
                        .setCustomId('cancele')
                        .setLabel('Annuler')
                        .setStyle('DANGER')
                )
            message.delete().catch(() => {});
            message.channel.send({ components: [ row ], embeds: [ pack.embeds.classic(user)
                .setTitle("Validation")
                .setColor('ORANGE')
                .setDescription(`${isImportant ? pack.emojis.important : pack.emojis.notimportant} Êtes-vous sûr de vouloir supprimer ce mail ? (\`${mailObject}\`)`)
            ] }).then((sended) => {
                const collectorValid = sended.createMessageComponentCollector({ filter: i => i.user.id === user.id && i.message.id === sended.id, time: 120000, max: 1 });
            
                collectorValid.on('collect', (i) => {
                    i.deferUpdate();
                });
                collectorValid.on('end', (collected, reason) => {
                    if (collected.size === 0) return sended.edit({ embeds: [ pack.embeds.cancel() ], components: [] });

                    if (collected.first().customId === 'cancele') {
                        sended.delete().catch(() => {});
                        this.mailbox(user, message.channel);
                        return;
                    } else {
                        this.db.query(`DELETE FROM mails WHERE id="${mailId}"`, (err) => {
                            if (err) return sended.edit({ embeds: [ pack.embeds.errorSQL(user) ], components: [] });
                            sended.edit({ embeds: [ pack.embeds.classic(user)
                                .setTitle("Mail supprimé")
                                .setDescription(`J'ai supprimé le mail ${mailObject}`)
                                .setColor('#00ff00')
                            ], components: [] }).catch(() => {});
                        })
                    }
                });
            });
        }

        message.edit({ embeds: [ pack.embeds.classic(user)
            .setTitle("Supprimer un mail")
            .setDescription(`Choisissez un mail pour le supprimer`)
            .setColor('ORANGE')
        ], components: [ new Discord.MessageActionRow().addComponents(menu) ] }).then((sent) => {
            const collector = sent.createMessageComponentCollector({ filter: i => i.user.id === user.id, time: 120000, max: 1 });

            collector.on('collect', /** @param {Discord.SelectMenuInteraction} interaction */(interaction) => {
                const value = interaction.values[0];

                if (value === 'cancel') return collector.stop('cancel');

                const mail = mails.find(x => x.id === parseInt(value));
                confirm(mail.id, mail.object, mail.important === 0 ? false : true);
            });

            collector.on('end', async(c, reason) => {
                if (reason === 'cancel') return await message.edit({ embeds: [ pack.embeds.cancel() ],components: [] }).catch(() => {});
            });
        });
    }
    /**
     * @param {Discord.User} user 
     * @param {Discord.TextChannel | 'none'} channel 
     * @param {Discord.CommandInteraction} interaction
     */
    mailbox(user, channel, interaction) {
        let sendFnt = async(params) => {
            if (channel !== 'none') {
                return await channel.send(params).catch(() => {});
            } else {
                if (interaction.replied) {
                    await interaction.editReply(params).catch(() => {});
                } else {
                    await interaction.reply(params).catch(() => {});
                }
                return await interaction.fetchReply();
            };
        };
        this.db.query(`SELECT * FROM mails WHERE user_id="${user.id}"`, (err, mails) => {
            if (err) return sendFnt({ embeds: [ pack.embeds.errorSQL(user) ] }) & console.log(err);

            const row = this.generateMailBoxButtons();                

            sendFnt({ embeds: [ pack.embeds.classic(user)
                .setTitle("Boite mail")
                .setDescription(`Bienvenue dans votre boite mail`)
                .setColor('ORANGE')
            ], components: [ row ] }).then((sent) => {
                const collector = sent.createMessageComponentCollector({ filter: i => i.user.id === user.id, time: 180000, max: 1 });

                collector.on('collect', (interaction) => {
                    if (interaction.customId === 'cancel') return collector.stop('cancel') & interaction.reply({ content: `Commande annulée`, ephemeral: true }) & sent.edit({ embeds: [ pack.embeds.cancel() ], components: [] });

                    interaction.deferUpdate();
                    if (interaction.customId === 'read') {
                        this.readMailsReaden(user, sent, mails.filter(x => x.vu === 1));
                    } else if (interaction.customId === 'noread') {
                        this.readMailsNotRead(user, sent, mails.filter(x => x.vu === 0));
                    } else {
                        this.deleteMail(user, sent, mails);
                    }
                });
            });
        });   
    }
    init() {
        this.client.on('messageCreate', (message) => {
            this.db.query(`SELECT * FROM mails WHERE user_id="${message.author.id}" AND vu="0"`, (err, req) => {
                if (err) return console.log(err);
                if (req.length === 0) return;

                
                this.db.query(`SELECT notified FROM mails_notif WHERE user_id="${message.author.id}"`, (e, r) => {
                    if (e) return console.log(e);
                    if (r.length > 0 && r[0].notified == "0") return;
                    
                    const chances = functions.random(15, 0);
                    if (chances === 6) {
                        let text = "";
                        if (functions.random(5, 0) == 3) {
                            text = `\n\n:bulb: Vous pouvez désactiver les notifications de mail avec \`/mail-notifs disable\``;
                        }
                        
                        message.channel.send({ embeds: [ pack.embeds.classic(message.author)
                            .setTitle("Nouveau mail")
                            .setDescription(`Vous avez ${req.length} mail${req.length > 1 ? 's':''} non-lu.\n\nUtilisez la commande \`/mailbox\` pour le${req.length > 1 ? 's':''} consulter.${text}`)
                            .setColor('ORANGE')
                        ] }).catch(() => {});
                    };
                })
            });
        });
    }
};

module.exports = MailManager
