const Discord = require('discord.js');
const functions = require('./functions');
const package = functions.package();

/**
 * @returns {Discord.Client}
 */
const Client = () => {
    return require('../index.js').client;
};


module.exports = {
    /**
     * 
     * @param {Discord.Guild} guild 
     * @param {Discord.User} user 
     */
    create: (guild, user, sujet) => {
        guild.channels.create(`Ticket-${user.id}`, {
            topic: `Ticket demandé par <@${user.id}>\n${sujet}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL', 'ADD_REACTIONS', "SEND_MESSAGES"]
                }
            ]
        }).then((channel) => {
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setLabel('Fermer')
                        .setCustomId('close-ticket')
                        .setStyle('SECONDARY')
                )

            channel.send({ embeds: [ package.embeds.classic(user)
                .setTitle("Ticket")
                .setDescription(`Ticket demandé par <@${user.id}>.\nCrée <t:${(Date.now() / 1000).toFixed(0)}:R>`)
                .setColor('ORANGE')
            ], components: [ row ] }).then((msg) => {

                const client = channel.client;

                client.db.query(`INSERT INTO tickets (guild_id, message_id, user_id, channel_id, type, subject) VALUES ("${guild.id}", "${msg.id}", "${user.id}", "${channel.id}", "ticket-message", "${sujet}")`, (err, req) => {
                    if (err) channel.send({ embeds: [ package.embeds.errorSQL(user) ] }) & console.log(err);
                });

                msg.channel.send({ content: `@everyone` }).catch(() => {});
            });
        });
    },
    close_ticket_panel: (guild, channel, user) => {
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('confirm-close-ticket')
                    .setLabel('Confirm')
                    .setStyle('SUCCESS'),
                new Discord.MessageButton()
                    .setLabel("Annuler")
                    .setCustomId('cancel-close-ticket')
                    .setStyle('DANGER')
            )

        channel.send({ embeds: [ package.embeds.classic(user)
            .setTitle("Fermeture de ticket")
            .setDescription(`Valider la fermeture du ticket`)
            .setColor('ORANGE')
        ], components: [ row ] }).then((x) => {
            const client = guild.client;
            client.db.query(`SELECT * FROM tickets WHERE channel_id="${channel.id}"`, (err, req) => {
                if (err) channel.send({ embeds: [ package.embeds.errorSQL(user) ] });

                let subject = "Unknown"
                if (req.length) subject = req[0].subject;

                client.db.query(`INSERT INTO tickets (guild_id, message_id, user_id, channel_id, type, subject) VALUES ("${guild.id}", "${x.id}", "${user.id}", "${channel.id}", "close-ticket-panel", "${subject}")`, (e) => {
                    if (e) {
                        console.log(e);
                        channel.send({ embeds: [ package.embeds.errorSQL(user) ] });
                    };
                });
            });
        });
    },
    /**
     * 
     * @param {Discord.Guild} guild 
     * @param {Discord.TextChannel} channel 
     * @param {Discord.User} user 
     */
    close_ticket: (guild, channel, user) => {
        channel.permissionOverwrites.edit(user, {
            VIEW_CHANNEL: false,
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            READ_MESSAGE_HISTORY: false
        })

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setLabel('Réouvrir')
                    .setCustomId('reopen-ticket')
                    .setStyle('PRIMARY'),
                new Discord.MessageButton()
                    .setLabel('Sauvegarder')
                    .setStyle('SECONDARY')
                    .setCustomId('save-ticket'),
                new Discord.MessageButton()
                    .setStyle('DANGER')
                    .setLabel('Supprimer le ticket')
                    .setCustomId('delete-ticket')
            )

        channel.send({ content: `Le ticket de <@${user.id}> a été fermé.`, components: [ row ] }).then((msg) => {
            let content = '';
            for (let i = 0; i < 8; i++) {
                let charact = user.username.charAt(i);
                if (charact !== undefined) content+=charact;
            };

            channel.setName(`ticket-${content}-fermé`);

            const client = guild.client;

            client.db.query(`SELECT * FROM tickets WHERE channel_id="${channel.id}"`, (err, req) => {
                if (err) channel.send({ embeds: [ package.embeds.errorSQL(user) ] });

                let subject = "Unknown"
                if (req.length) subject = req[0].subject;

                client.db.query(`INSERT INTO tickets (guild_id, message_id, user_id, channel_id, type, subject) VALUES ("${guild.id}", "${msg.id}", "${user.id}", "${channel.id}", "panel-closed-ticket", "${subject}")`, (e) => {
                    if (e) {
                        console.log(e);
                        channel.send({ embeds: [ package.embeds.errorSQL(user) ] });
                    };
                });
            });
        });
    },
    /**
     * @param {Discord.TextChannel} channel 
     * @param {Discord.User} user
     */
    save_transcript: (channel, user) => {
        const path = `./assets/transcripts/${channel.id}-${channel.guild.id}.txt`;
        const fs = require('fs');
        
        const writeTranscript = (toWrite) => {
            fs.writeFileSync(path, toWrite);
        };
        writeTranscript("");

        let content = `
Ticket de ${user.tag}
${channel.name}\n\n`

        channel.messages.cache.filter((x) => x.author && !x.author.bot).forEach((msg) => {
            content+= `\n${msg.author.tag} : ${msg.content}`;
        });

        writeTranscript(content);
        
        const attachment = new Discord.MessageAttachment(path, 'transcript.txt');
        channel.send({ files: [ attachment ], content: `Voici la retranscription de la conversation.` }).catch(() => {}).then((x) => {
            fs.rmSync(path);
        });
    },
    /**
     * @param {Discord.GuildChannel} channel 
     * @param {Discord.User} user User who opens the ticket
     */
    reopen: (channel, user) => {
        channel.permissionOverwrites.edit(user, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            ADD_REACTIONS: true,
            READ_MESSAGE_HISTORY: true
        })

        channel.setName(`ticket-${user.id}`);
        channel.send({ content: `Le ticket de <@${user.id}> a été ré-ouvert.` }).catch((e) => console.log(e));
    },
    /**
     * @param {Discord.TextChannel} channel Ticket 
     * @param {Discord.User} user
     */
    delete: (channel, user) => {
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('cancel-close-ticket-delete')
                    .setEmoji('❌')
                    .setStyle('DANGER')
            )
        channel.send({ content: `Le ticket sera supprimé dans **10 secondes** si <@${user.id}> ne l'annule pas avant`, components: [ row ] }).then((msg) => {           
            const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id === user.id , time: 10000, max: 1});

            collector.on('end', (collected) => {
                msg.delete().catch(() => {});

                if (collected.size != 0) return;
                channel.delete().catch(() => {});

                const client = channel.client;
                client.db.query(`DELETE FROM tickets WHERE guild_id="${channel.guild.id}" AND channel_id="${channel.id}"`, (err, req) => {
                    if (err) console.log(err);
                });
            });
        })
    },
    /**
     * @returns {Boolean}
     * @param {Discord.TextChannel} channel 
     */
    isTicket: (channel) => {
        const files = reqTickets(channel.guild);
        if (files.filter((x) => x.channel === channel.id && x.type === 'ticket-message').length == 0) return false;

        return true;
    }
}