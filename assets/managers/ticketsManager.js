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
const save = require('../scripts/htmlSave');

class TicketsManager {
    /**
     * @param {Discord.Client} client 
     * @param {mysql.Connection} db 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
        this.tickets = new Discord.Collection();
        this.configs = new Discord.Collection();
        this.meanGuillement = "alt3";
    }
    isTicket(id) {
        if (this.tickets.has(id)) return true;

        if (this.tickets.find(x => x.channel_id == id && x.type !== 'ticket-panel')) return true;
        return false;
    }
    validString(str) {
        if (str.includes('"')) return false;
        if (str.length > 255) return false;
        return true;
    }
    /**
     * 
     * @param {{ guild: Discord.Guild, channel: Discord.NonThreadGuildBasedChannel, subject: String, user: Discord.User, description: String, image: String }} data 
     */
    createPanel(data) {
        if (data.channel.type !== 'GUILD_TEXT') return 'not a text channel';
        if (!this.validString(data.subject)) return 'not a valid text';

        const panel = new Discord.EmbedBuilder()
        .setTitle("Panel de ticket")
        .setDescription(`__Sujet du ticket :__ ${data.subject}\n__Description :__\n${data.description}\n\nRappel :\n→ Pas de spam\n→ Pas de troll\n\nAppuyez sur le bouton pour ouvrir un ticket.`)
        .setColor(data.guild.me.displayHexColor)
        .setTimestamp()

        if (data.image) panel.setImage(data.image);
        
        data.channel.send({ embeds: [ panel ], components: [ new Discord.ActionRowBuilder().addComponents(new Discord.MessageButton({ customId: 'ticket_panel', emoji: '📥', style: 'SECONDARY' })) ] }).then((sent) => {
            const dataset = {
                message_id: sent.id,
                guild_id: sent.guild.id,
                channel_id: sent.channel.id,
                type: 'ticket-panel',
                user_id: data.user.id,
                subject: data.subject
            };

            this.tickets.set(sent.id, dataset);
            let sql = `INSERT INTO tickets (${Object.keys(dataset).join(', ')}) VALUES (${Object.keys(dataset).map(key => dataset[key]).map(x => `"${x}"`).join(', ')})`;

            this.db.query(sql, (err, req) => {
                if (err) throw err;
            });
        });
    }
    /**
     * @param {{ guild: Discord.Guild, sujet: String, user: Discord.User, image: String }} data 
     */
    createTicket(data) {
        if (!this.validString(data.sujet)) return 'not a valid text';
        let { roles } = this.configs.get(data.guild.id);
        if (!roles) roles = [];
        
        const embed = new Discord.EmbedBuilder()
            .setTitle("Ticket")
            .setDescription(`Ticket ouvert par <@${data.user.id}>.\n__Sujet :__ ${data.sujet}`)
            .setColor(data.guild.me.displayHexColor)
        
        if (data.image) embed.setImage(data.image);

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId('ticket-close')
                    .setEmoji('🔐'),
                new Discord.MessageButton()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId('mention-everyone')
                    .setLabel('mentionner everyone')
            )
        
        const permissions = [{id: data.user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'ATTACH_FILES'], deny: ['MENTION_EVERYONE', 'MUTE_MEMBERS']}, { id: data.guild.id, deny: ['VIEW_CHANNEL'] }];
        if (roles.length > 0) {
            for (const rId of roles) {
                permissions.push({ id: rId, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'ATTACH_FILES'] });
            };
        };

        data.guild.channels.create(`Ticket-${functions.random(9, 0)}${functions.random(9, 0)}${functions.random(9, 0)}${functions.random(9, 0)}`, {permissionOverwrites: permissions}).then((channel) => {
            channel.send({ embeds: [ embed ], components: [ row ], content: `<@${data.user.id}>, votre ticket a été crée.` }).then((sent) => {
                const dataset = {
                    guild_id: data.guild.id,
                    channel_id: channel.id,
                    message_id: sent.id,
                    user_id: data.user.id,
                    type: 'ticket-message',
                    subject: data.sujet,
                    name: channel.name
                };
                sent.pin().catch(() => {});

                this.tickets.set(sent.id, dataset);
                let sql = `INSERT INTO tickets (${Object.keys(dataset).join(', ')}) VALUES (${Object.keys(dataset).map(key => dataset[key]).map(x => `"${x}"`).join(', ')})`;

            this.db.query(sql, (err, req) => {
                if (err) throw err;
            });
            });
        }).catch(() => {});
    }
    /**
     * @returns {String}
     * @param {{ channel: Discord.BaseGuildTextChannel }} data 
     */
    async saveTicket(data) {
        if (!this.isTicket(data.channel.id)) return "not a ticket";

        let messages = await data.channel.messages.fetch();
        const customId = `${data.channel.guild.id}-${data.channel.id}`
        save(messages, customId);
        
        return `./assets/scripts/${customId}.html`;
    }
    /**
     * @param {{ channel: Discord.BaseGuildTextChannel }} data 
     */
    async closeTicket(data) {
        if (!this.isTicket(data.channel.id)) return 'not a ticket';
        const ticket = this.tickets.find(x => x.channel_id == data.channel.id && x.type == 'ticket-message');

        const menu = data.channel.messages.cache.get(ticket.message_id);
        if (!menu) return 'error: menu not found';

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId('ticket-reopen')
                    .setEmoji('🔓'),
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId('ticket-save')
                    .setEmoji('📜'),
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId('ticket-delete')
                    .setEmoji('🗑')
            )

        const user = data.channel.guild.members.cache.get(ticket.user_id);
            
        data.channel.permissionOverwrites.edit(user, { VIEW_CHANNEL: false }).catch(() => {});
            
        menu.edit({ components: [ row ] }).catch(() => {});
        await data.channel.setName(ticket.name + '-fermé').catch((e) => {console.log(e)});
    }
    /**
     * @param {{ channel: Discord.GuildTextBasedChannel }} data 
     */
    reopenTicket(data) {
        if (!this.isTicket(data.channel.id)) return 'not a ticket';

        const ticket = this.tickets.find(x => x.channel_id == data.channel.id && x.type == 'ticket-message');
        const menu = data.channel.messages.cache.get(ticket.message_id);
        if (!menu) return 'error: menu not found';

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId('ticket-close')
                    .setEmoji('🔐')
            );

            
        const user = data.channel.guild.members.cache.get(ticket.user_id);
        menu.edit({ components: [ row ] }).catch(() => {});
        data.channel.permissionOverwrites.edit(user, { VIEW_CHANNEL: true }).catch(() => {});
        
        data.channel.setName(ticket.name);
    }
    /**
     * @param {{ channel: Discord.GuildTextBasedChannel }} data 
     */
    delete(data) {
        if (!this.isTicket(data.channel.id)) return 'not a ticket';

        this.db.query(`DELETE FROM tickets WHERE channel_id="${data.channel.id}"`, (err, req) => {
            this.loadCache();
        });
        data.channel.delete().catch((e) => {console.log(e)});
    }
    /**
     * @param {{ channel: Discord.GuildTextBasedChannel, menu: Discord.Message, user: Discord.User }} data
     */
    pingEveryone(data) {
        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId('ticket-close')
                    .setEmoji('🔐')
            )
        
        data.menu.edit({ components: [ row ] }).catch(() => {});
        data.channel.send({ embeds: [ pack.embeds.classic(data.user)
            .setTitle("Mention everyone")
            .setDescription(`<@${data.user.id}> vient de mentionner everyone.`)
            .setColor(data.channel.guild.me.displayHexColor)
        ], content: `@everyone` }).catch(() => {});
    }
    /**
     * @param {{ channel: Discord.GuildTextBasedChannel, name: String }} data
     */
    ticketRename(data) {
        if (!this.isTicket(data.channel.id)) return 'not a ticket';

        this.db.query(`UPDATE tickets SET name="${data.name}" WHERE channel_id="${data.channel.id}"`, (err, req) => {
            data.channel.setName(data.name);

            this.loadCache();
        });
    }
    /**
     * @param {{ channel: Discord.GuildTextBasedChannel }} data
     */
    getTicketName(data) {
        if (!this.isTicket(data.channel.id)) return 'not a ticket';

        return this.tickets.find((x) => x.channel_id == data.channel.id).name;
    }
    resetCache() {
        this.tickets = new Discord.Collection();
        this.configs = new Discord.Collection();
    }
    loadCache() {
        this.db.query(`SELECT * FROM tickets`, (err, req) => {
            if (err) throw err;
            
            this.db.query(`SELECT ticket_enable, ticket_roles, guild_id FROM configs`, (er, re) => {
                if (er) throw er;
                
                this.resetCache();
                re.forEach((conf) => {
                    this.configs.set(conf.guild_id, {
                        enable: conf.ticket_enable == "1",
                        roles: JSON.parse(conf.ticket_roles).map(x => x.toString())
                    });
                });
                req.forEach((ticket) => {
                    this.tickets.set(ticket.message_id, ticket);
                });

            })
        })
    }
    checkForActivation(interaction) {
        const activated = this.configs.get(interaction.guild.id).enable;
        if (activated == false) {
            interaction.reply({ embeds: [ pack.embeds.classic(interaction.user)
                .setTitle("Système désactivé")
                .setDescription(`Le système de tickets est **désactivé**.\n\nVeuillez l'activer pour utiliser les commandes de ticket.\n:bulb:\n> Utilisez la commande \`/config configurer\``)
                .setColor('#ff0000')
            ], ephemeral: true }).catch(() => {});
            return false;
        };
        return true;
    }
    loadInteraction() {
        this.client.on('interactionCreate', /** @param {Discord.ButtonInteraction} interaction */ async(interaction) => {
            if (interaction.isButton()) {
                const id = interaction.customId;
                if (id == 'ticket_panel') {
                    if (!this.checkForActivation(interaction)) return;
                    
                    let { subject } = this.tickets.get(interaction.message.id);

                    await interaction.deferUpdate();
                    const dataset = { guild: interaction.guild, sujet: subject, user: interaction.user };
                    if (interaction.message.embeds[0].image) dataset.image = interaction.message.embeds[0].image.url;
                    this.createTicket(dataset);
                };
                if (id == 'mention-everyone') {
                    if (!this.checkForActivation(interaction)) return;
                    await interaction.reply({ embeds: [ pack.embeds.classic(interaction.user)
                        .setTitle("Mention everyone")
                        .setDescription(`Êtes-vous sûr de vouloir mentionner everyone ?`)
                        .setColor('YELLOW')
                    ], components: [
                        new Discord.ActionRowBuilder()
                            .addComponents(
                                new Discord.ButtonBuilder()
                                    .setLabel('Oui')
                                    .setStyle(Discord.ButtonStyle.Success)
                                    .setCustomId('yes'),
                                new Discord.MessageButton()
                                    .setLabel('Non')
                                    .setStyle(Discord.ButtonStyle.Danger)
                                    .setCustomId('no')
                            )
                    ], ephemeral: true });

                    const msg = await interaction.fetchReply();
                    const collector = msg.createMessageComponentCollector({ filter: x => x.user.id == interaction.user.id, time: 120000, max: 1 });

                    collector.on('collect', async(i) => {
                        await i.deferUpdate();
                        if (i.customId == 'yes') {
                            this.pingEveryone({ channel: interaction.channel, menu: interaction.message, user: interaction.user });
                        };

                        msg.delete().catch(() => {});
                    });
                };
                if (id == 'ticket-close') {
                    if (!this.checkForActivation(interaction)) return;
                    await interaction.deferUpdate();

                    this.closeTicket({ channel: interaction.channel });
                };
                if (id == 'ticket-save') {
                    if (!this.checkForActivation(interaction)) return;
                    const customId = await this.saveTicket({ channel: interaction.channel });
                    interaction.deferReply();

                    setTimeout(() => {
                        const attachment = new Discord.AttachmentBuilder()
                            .setFile(customId)
                            .setName(`${interaction.channel.name}-ticket-save.html`)
                            .setDescription(`Sauvegarde du ticket`)
                            .setSpoiler(false)
                                                
                        interaction.editReply({ files: [ attachment ], embeds: [ pack.embeds.classic(interaction.user)
                            .setTitle("Sauvegarde")
                            .setDescription(`Le ticket a été sauvegardé`)
                            .setColor(interaction.guild.me.displayHexColor)
                        ] }).catch((e) => {console.log(e)});
                    }, 3000)
                };
                if (id == 'ticket-reopen') {
                    if (!this.checkForActivation(interaction)) return;
                    await interaction.deferUpdate();

                    this.reopenTicket({ channel: interaction.channel });
                };
                if (id == 'ticket-delete') {
                    if (!this.checkForActivation(interaction)) return;
                    await interaction.deferUpdate();

                    this.delete({ channel: interaction.channel });
                }
            }
        });
    }
    init() {
        this.loadCache();
        this.loadInteraction();

        console.log(`Tickets Manager is ready !`);
    }
};

module.exports = TicketsManager;