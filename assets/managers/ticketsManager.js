let sql = `CREATE TABLE tickets (
    guild_id VARCHAR(255),
    message_id VARCHAR(255),
    user_id VARCHAR(255),
    channel_id VARCHAR(255),
    type VARCHAR(255),
    subject VARCHAR(255)
)`;

const functions = require('../functions');
const pack = functions.package();

const Discord = require('discord.js');
const { writeFileSync, rmSync } = require('fs');

class TicketsManager {
    /**
     * @param {Discord.Client} client 
     * @param {mysql.Connection} db 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
        this.tickets = new Discord.Collection();
        this.meanGuillement = "alt3";
    }
    ticketExist(id) {
        let exist = this.tickets.has(id);
        if (exist) return true;

        exist = this.tickets.find(x => x.channel_id == id) ? true : false;
        return exist;
    }
    toString = str => str.replace(new RegExp('"', 'g'), this.meanGuillement)
    validString = str => str.length < 256
    toUser = str => str.replace(new RegExp(this.meanGuillement, 'g'), '"')
    getTicketName(name) {
        if (name.length < 7) return name;
        let data = "";
        for (let i = 0; i < 6; i ++) {
            data+=name[i];
        };

        return data;
    }
    async getChannel(guild, channelID) {
        await guild.channels.fetch();
        return guild.channels.cache.get(channelID);
    }
    async getGuild(id) {
        await this.client.guilds.fetch();
        return this.client.guilds.cache.get(id);
    }
    /**
     * @returns {undefined | { guild: Discord.Guild, channel: Discord.GuildTextBasedChannel, user: Discord.User }} 
     */
    async getAll(id) {
        if (!this.ticketExist(id)) return undefined;
        const ticket = this.tickets.get(id);

        const guild = this.getGuild(ticket.guild_id);
        if (!guild) return guild;

        const channel = this.getChannel(guild, ticket.channel_id);
        if (!channel) return channel;

        const user = this.getUser(guild, id);
        if (!user) return user;

        return { guild, channel, user };
    }
    /**
     * @param {{ guild: Discord.Guild, user: Discord.User: sujet: String }} data 
     */
    create(data) {
        data.sujet = this.toString(data.sujet);
        if (!this.validString(data.sujet)) return 'invalid subject';

        data.guild.channels.create(`Ticket-${this.getTicketName(data.user.username)}`, {
            permissionOverwrites: [
                {
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'EMBED_LINKS'],
                    id: data.user.id
                },
                {
                    deny: ['VIEW_CHANNEL'],
                    id: data.guild.id,
                }
            ],
            reason: data.sujet,
            topic: `Ticket demandé par <@${data.user.id}>.\n${this.toUser(data.sujet)}`
        }).then((channel) => {
            const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setLabel('Fermer')
                        .setCustomId('close-ticket')
                        .setStyle('SECONDARY')
                )

            channel.send({ embeds: [ pack.embeds.classic(data.user)
                .setTitle("Ticket")
                .setDescription(`Ticket demandé par <@${data.user.id}>.`)
                .setColor('ORANGE')
            ], components: [ row ] }).then((sent) => {
                this.tickets.set(sent.id, {
                    guild_id: data.guild.id,
                    channel_id: channel.id,
                    subject: data.sujet,
                    user_id: data.user.id,
                    message_id: sent.id,
                    type: 'panel'
                });

                this.db.query(`INSERT INTO tickets (guild_id, channel_id, message_id, user_id, type, subject) VALUES ("${data.guild.id}", "${channel.id}", "${sent.id}", "${data.user.id}", "panel", "${data.sujet}")`)
            });
        });
    }
    close(id) {
        if (!this.ticketExist(id)) return new Error("ticket not exist");

        const data = this.getAll(id);

        data.channel.permissionOverwrites.edit(data.user, {
            VIEW_CHANNEL: false
        }).catch(() => {});

        let name = 'ticket ' +  this.getTicketName(data.user.username) + " closed";

        data.channel.setName(name).catch(() => {});

        const components = [
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
        ];

        data.channel.send({ embeds: [ pack.embeds.classic(data.user)
            .setTitle("Ticket fermé")
            .setDescription(`Le ticket de <@${data.user.id}> a été fermé <t:${Date.now() / 1000}:R>`)
            .setColor("ORANGE")
        ], components: [ new Discord.MessageActionRow({ components }) ] }).then((sent) => {
            this.tickets.set(sent.id, {
                message_id: sent.id,
                channel_id: data.channel.id,
                guild_id: data.guild.id,
                user_id: data.user.id,
                subjet: this.tickets.get(id).subject,
                type: 'close-ticket-panel'
            });

            this.db.query(`INSERT INTO tickets (guild_id, message_id, channel_id, user_id, subject, type) VALUES ("${data.guild.id}", "${sent.id}", "${data.channel.id}", "${data.user.id}", "${this.tickets.get(id).subject}", "close-ticket-panel")`, e => { if (e) throw e });
        }).catch(() => {});
    }
    reopen(id) {
        if (!this.ticketExist(id)) return new Error('ticket not exist');

        const data = this.getAll(id);

        data.channel.permissionOverwrites.edit(data.user, {
            VIEW_CHANNEL: true
        }).catch(() => {});
    }
    /**
     * @param {Discord.User} user
     */
    delete(id, user) {
        if (!this.ticketExist(id)) return new Error("Ticket not exist");

        const data = this.getAll(id);

        data.channel.send({ content: `Le ticket de ${data.user.username} va être supprimé <t:${(Date.now() + 10000) / 1000}:R>, si <@${user.id}> ne l'annule pas avant.`, components: [ new Discord.MessageActionRow({ components: [ new Discord.MessageButton({ style: 'DANGER', emoji: '❌', customId: 'cancel' }) ] }) ] }).then((sent) => {
            const collector = sent.createMessageComponentCollector({ filter: x => x.user.id == user.id, time: 10000, max: 1 });

            collector.on('end', (collected) => {
                if (collected.size == 1) return sent.delete().catch(() => {});

                data.channel.delete().catch(() => {});
                this.db.query(`DELETE FROM tickets WHERE channel_id="${data.channel.id}"`, (e) => {if (e) throw e; this.clearCache(); this.loadCache()});
            });
        }).catch(() => {});
    }
    async transcript(id) {
        if (!this.ticketExist(id)) return new Error("ticket not exist");
        const data = this.getAll(id);

        let content = `Ticket ${this.tickets.get(id).subjet}.\nDemandé par ${data.user.username} ( ${data.user.id} ).\n`

        await data.channel.messages.fetch();
        data.channel.messages.cache.forEach((msg) => {
            content+= `\n${msg.author.tag} ( ${msg.author.id} ) : ${msg.content}`;
        });

        return content;
    }
    /**
     * @param {{ sujet: String, channel: Discord.GuildTextBasedChannel }} data 
     */
    createPanel(data) {
        if (!data.channel.type == 'GUILD_TEXT') return new Error("Not a valid channel");
        data.botSujet = this.toString(data.sujet);
        if(!this.validString(data.botSujet)) return new Error("Invalid string");

        const embed = new Discord.MessageEmbed()
            .setTitle("Ticket")
            .setDescription(`Utilisez le bouton pour ouvrir un ticket.\n**Sujet:\n> ${data.sujet}`)
            .setColor(data.channel.guild.me.displayHexColor)
            .setTimestamp()
        
        if(data.channel.guild.icon) embed.setFooter({ text: data.channel.guild.name, iconURL: data.channel.guild.iconURL({ dynamic: true }) });

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setStyle("SECONDARY")
                    .setLabel("Ouvrir un ticket")
                    .setEmoji('📩')
                    .setCustomId('ticket-create')
            );
        
        data.channel.send({ embeds: [ embed ], components: [ row ] }).then((sent) => {
            this.tickets.set(sent.id, {
                message_id: sent.id,
                channel_id: data.channel.id,
                guild_id: data.channel.guild.id,
                user_id: 'none',
                subject: data.botSujet,
                type: 'ticket-panel'
            });

            this.db.query(`INSERT INTO tickets (guild_id, channel_id, message_id, user_id, subject, type) VALUES ("${data.channel.guild.id}", "${data.channel.id}", "${sent.id}", "none", "${data.botSujet}", "ticket-panel")`, (e) =>  { if (e) throw e });
        });
    }
    rename(id, name) {
        if(!this.ticketExist(id)) return new Error("Ticket not exist");

        const { channel } = this.getAll(id);
        channel.setName(name).catch(() => {});
    }
    add(id, user) {
        if(!this.ticketExist(id)) return new Error("Ticket not exist");

        const { channel } = this.getAll(id);
        channel.permissionOverwrites.edit(user.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            ADD_REACTIONS: true
        }).catch(() => {});
    }
    remove(id, user) {
        if(!this.ticketExist(id)) return new Error("Ticket not exist");

        const { channel } = this.getAll(id);
        channel.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: false }).catch(() => {});
    }
    /**
     * @param {Discord.Guild} guild 
     * @param {String} ticketID 
     */
    async getUser(guild, ticketID) {
        await guild.members.fetch();
        let member = guild.members.cache.get(this.tickets.get(ticketID).user_id);

        if (!member) return member;
        return member.user;
    }
    clearCache() {
        this.tickets = new Discord.Collection();
    }
    loadCache() {
        this.db.query(`SELECT * FROM tickets`, (err, req) => {
            if (err) throw err;

            req.forEach((re) => {
                this.tickets.set(re.message_id, re);
            });
        });
    }
    /**
     * @param {Discord.ButtonInteraction} interaction 
     */
    onInteraction(interaction) {
        if (!interaction.guild || !interaction.isButton()) return;
        if (!this.ticketExist(interaction.message.id)) return;

        const ticket = this.tickets.get(interaction.message.id);
        let reply;

        switch (interaction.customId) {
            case 'close-ticket':
                this.close(ticket.message_id);
                reply = 'Ticket fermé';
            break;
            case 'reopen-ticket':
                reply = 'Ticket réouvert';
                this.reopen(ticket.message_id);
            break;
            case 'save-ticket':
                const save = this.transcript(interaction.message.id);

                writeFileSync(`./assets/transcripts/${interaction.message.id}.txt`, save);
                const file = new Discord.MessageAttachment()
                    .setFile(`./assets/transcripts/${interaction.message.id}.txt`, 'sauvegarde')
                
                interaction.reply({ content: `Sauvegarde`, attachments: [ file ] }).catch(() => {});
                rmSync(`./assets/transcripts/${interaction.message.id}.txt`);
            break;
            case 'delete-ticket':
                reply = "Procéssus démarré";
                this.delete();
            break;
            case 'create-ticket':
                this.create({
                    guild: interaction.guild,
                    sujet: ticket.subject,
                    user: interaction.user
                });
                reply = "Je crée votre ticket";
            break;
        };

        if (reply !== undefined) {
            interaction.reply({ content: reply }).catch(() => {});
        };
    }
    init() {
        this.loadCache();
        this.client.on('interactionCreate', (i) => {
            this.onInteraction(i);
        });
    }
};

module.exports = TicketsManager;