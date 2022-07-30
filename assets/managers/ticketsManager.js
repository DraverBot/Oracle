let sql = `CREATE TABLE tickets (
    guild_id VARCHAR(255) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    channel_id VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL
);

ALTER TABLE tickets ADD PRIMARY KEY ( message_id )`;

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
    isTicket(id) {
        if (this.tickets.has(id)) return true;

        if (this.tickets.find(x => x.channel_id == id)) return true;
        return false;
    }
    validString(str) {
        if (str.includes('"')) return false;
        if (str.length > 255) return false;
        return true;
    }
    /**
     * 
     * @param {{ guild: Discord.Guild, channel: Discord.NonThreadGuildBasedChannel, subject: String, user: Discord.User }} data 
     */
    createPanel(data) {
        if (data.channel.type !== 'GUILD_TEXT') return 'not a text channel';
        if (!this.validString(data.subject)) return 'not a valid text';

        data.channel.send({ embeds: [ new Discord.MessageEmbed()
            .setTitle("Panel de ticket")
            .setDescription(`__Sujet du ticket :__ ${data.subject}\n\nRappel :\n→ Pas de spam\n→ Pas de troll`)
            .setColor(data.guild.me.displayHexColor)
            .setTimestamp()
        ], components: [ new Discord.MessageActionRow().addComponents(new Discord.MessageButton({ customId: 'ticket_panel', emoji: '📥', style: 'SECONDARY' })) ] }).then((sent) => {
            const dataset = {
                message_id: sent.id,
                guild_id: sent.guild.id,
                channel_id: sent.channel.id,
                type: 'ticket-panel',
                user_id: data.user.id,
                subjet: data.subject
            };

            this.tickets.set(sent.id, dataset);
            let sql = `INSERT INTO tickets (${Object.keys(dataset).join(', ')}) VALUES (${Object.keys(dataset).map(key => dataset[key]).map(x => `"${x}"`).join(', ')})`;

            this.db.query(sql, (err, req) => {
                if (err) throw err;
            });
        });
    }
    /**
     * @param {{ guild: Discord.Guild, sujet: String, user: Discord.User }} data 
     */
    createTicket(data) {
        if (!this.validString(data.sujet)) return 'not a valid text';
        const embed = new Discord.MessageEmbed()
            .setTitle("Ticket")
            .setDescription(`Ticket ouvert par <@${data.user.id}>.\n__Sujet :__ ${data.sujet}`)
            .setColor(data.guild.me.displayHexColor)

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('ticket-close')
                    .setEmoji('🔐'),
                new Discord.MessageButton()
                    .setStyle("DANGER")
                    .setCustomId('mention-everyone')
                    .setLabel('mentionner everyone')
            )
        
        data.guild.channels.create(`Ticket-${functions.random(9, 0)}${functions.random(9, 0)}${functions.random(9, 0)}${functions.random(9, 0)}`).then((channel) => {
            channel.send({ embeds: [ embed ], components: [ row ] }).then((sent) => {
                const dataset = {
                    guild_id: data.guild.id,
                    channel_id: channel.id,
                    message_id: sent.id,
                    user_id: data.user.id,
                    type: 'ticket-message',
                    subject: data.sujet
                };

                this.tickets.set(sent.id, dataset);
                let sql = `INSERT INTO tickets (${Object.keys(dataset).join(', ')}) VALUES (${Object.keys(dataset).map(key => dataset[key]).map(x => `"${x}"`).join(', ')})`;

            this.db.query(sql, (err, req) => {
                if (err) throw err;
            });
            });
        });
    }
    loadCache() {
        this.db.query(`SELECT * FROM tickets`, (err, req) => {
            if (err) throw err;
            req.forEach((ticket) => {
                this.tickets.set(ticket.message_id, ticket);
            });
        })
    }
    loadInteraction() {
        this.client.on('interactionCreate', (interaction) => {

        });
    }
    init() {
        this.loadCache();
        this.loadInteraction();

        console.log(`${this.client.user.username}'s tickets Manager is ready !`);
    }
};

module.exports = TicketsManager;