const { Client, Collection, TextChannel, GuildMember, ButtonInteraction, Guild, Message } = require('discord.js');
const mysql = require('mysql');

const embeds = require('./assets/embeds');
const buttons = require('./assets/buttons');

class GiveawaysManager {
    /**
     * @param {Client} client 
     * @param {mysql.Connection} db 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
        this.giveaways = new Collection();
        this.ended = new Collection();
        this.timeout = new Collection();
    }
    getUrl(data) {
        return `https://discord.com/channels/${data.guild_id}/${data.channel_id}/${data.message_id}`;
    }
    /**
     * @param {{ reward: String, winnerCount: Number, hosterId: String, channel: TextChannel, time: Number, ?bonusRoles: String[], ?deniedRoles: String[], ?requiredRoles: String[] }} data 
     */
    start(data) {
        if (!data.channel?.guild) return 'no guild';

        const embed = embeds.giveaway(data);
        const row = buttons.getAsRow([ buttons.participate(), buttons.cancelParticipation() ]);

        data.channel.send({ embeds: [ embed ], components: [ row ] }).then((sent) => {
            let dataset = {
                reward: data.reward,
                hoster_id: data.hosterId,
                guild_id: data.channel.guild.id,
                channel_id: data.channel.id,
                message_id: sent.id,
                winnerCount: data.winnerCount,
                winners: [],
                ended: false,
                participants: [],
                required_roles: data.requiredRoles ?? [],
                bonus_roles: data.bonusRoles ?? [],
                denied_roles: data.deniedRoles ?? [],
                endsAt: Date.now() + data.time
            };

            let sql = this.createQuery(this.formatToSql(dataset), false);
            this.giveaways.set(sent.id, this.formatToObject(dataset));

            this.db.query(sql, (err) => {
                if (err) throw err;
            });
        }).catch((e) => {console.log(e)});
    }
    /**
     * @param {GuildMember} member
     */
    checkIfValidEntry(member, x) {
        let data = this.formatToObject(x);
        if (data.denied_roles && data.denied_roles?.length > 0) {
            let has = false;
            for (const role of data.denied_roles) {
                if (member.roles.cache.has(role)) has = true;
            };

            if (has) {
                return {
                    embed: embeds.hasDeniedRoles(data.denied_roles, this.getUrl(data)),
                    state: false
                }
            }
        };
        if (data.required_roles && data.required_roles.length > 0) {
            let has = true;
            for (const role of data.required_roles) {
                if (!member.roles.cache.has(role)) has = false;
            };

            if (!has) {
                return {
                    embed: embeds.missingRequiredRoles(data.required_roles, this.getUrl(data)),
                    state: false                    
                };
            };
        };
        return {
            embed: embeds.entryAllowed(this.getUrl(data)),
            state: true
        };
    }
    /**
     * @param {{}} data 
     * @param {Boolean} exists
     */
    createQuery(data, exists) {
        const arrays = ['participants', 'bonus_roles', 'denied_roles', 'required_roles', 'winners'];

        let sql = `INSERT INTO giveaways (${Object.keys(data).join(', ')}) VALUES ( ${Object.values(data).map(x => x.toString().includes('[') ? `'${x}'` : (typeof x =="string") ? `"${x.replace(/"/g, '\\"')}"`: `"${x}"`).join(', ')} )`;

        if (exists == true) {
            sql = `UPDATE giveaways SET ${Object.keys(data).map((x => `${x}=${(typeof data[x] == "string" && arrays.includes(x)) ? `'${data[x].replace(/"/g, '\\"')}'` : `"${data[x]}"`}`)).join(', ')} WHERE message_id="${data.message_id}"`;
        };

        return sql;
    }
    formatToSql(data) {
        let gw = data;
        const arrays = ['participants', 'bonus_roles', 'denied_roles', 'required_roles', 'winners'];
        
        for (const prop of arrays) {
            if (typeof gw[prop] == 'object') gw[prop] = JSON.stringify(gw[prop]);
        };
        gw.ended = gw.ended == true ? '1' : "0";
        for (const string of Object.keys(gw).filter(x => typeof gw[x] == "string" && !arrays.includes(x))) {
            gw[string] = gw[string].replace(/"/g, '\\"');
        };

        return gw;
    }
    formatToObject(data) {
        let gw = data;
        
        for (const prop of ['participants', 'bonus_roles', 'denied_roles', 'required_roles', 'winners']) {
            if (typeof gw[prop] == 'string') gw[prop] = JSON.parse(gw[prop]);
        };

        gw.winnerCount = parseInt(gw.winnerCount);
        gw.endsAt = parseInt(gw.endsAt);
        gw.ended = gw.ended == "1";

        for (const string of Object.keys(data).filter(x => typeof gw[x] == "string")) {
            gw[string] = gw[string].replace(/\\"/g, '"');
        };

        return gw;
    }
    /**
     * @param {{ guild: Guild, channel: TextChannel, message: Message }} data 
     */
    async roll(x, data) {
        let gw = this.formatToObject(x);
        
        if (gw.participants.length == 0) return [];
        let participants = [];

        for (const id of gw.participants) {
            const member = await data.guild.members.fetch(id);
            if (!member) return console.log('hey');

            participants.push(id);
            if (gw.bonus_roles?.length > 0) {
                for (const rId of gw.bonus_roles) {
                    if (member.roles.cache.has(rId)) participants.push(id);
                };
            };
        };

        if (participants.length == 0) return [];

        let winners = [];
        const roll = () => {
            let winner = participants[Math.floor(Math.random() * participants.length)];
            if (winner) {
                participants = participants.filter(x => x !== winner);
            };
            return winner;
        };

        let i = 0;
        let end = false;
        while (end == false) {
            i++;
            let winner = roll();

            if (winner) winners.push(winner);
            if (participants.length == 0 || i == gw.winnerCount) end = true;
        };

        return winners;
    }
    /**
     * @param {String} messageId 
     * @returns { "no giveaway" | "no guild" | "no channel" | "no message" | "no winner" | "not ended" | String[] }
     */
    async reroll(messageId) {
        let gw = this.ended.get(messageId);
        if (!gw && this.giveaways.has(messageId)) return 'not ended';
        if (!gw) return 'no giveaway';


        const guild = this.client.guilds.cache.get(gw.guild_id);
        if (!guild) return 'no guild';

        const channel = guild.channels.cache.get(gw.channel_id);
        if (!channel) return 'no channel';

        const message = await channel.messages.fetch(messageId);
        if (!message) return 'no message';

        let winners = await this.roll(gw, { guild, channel, message });
        gw.winners = winners;
        const embed = embeds.ended(gw, winners);

        message.edit({ embeds: [ embed ] }).catch(() => {});
        channel.send({ reply: { messageReference: message }, embeds: [ embeds.winners(winners, this.getUrl(gw)) ] }).catch(() => {});
        
        let sql = this.createQuery(this.formatToSql(gw), true);
        this.db.query(sql, (err) => {
            if (err) throw err;
        });
        
        this.ended.set(messageId, gw);

        return winners;
    }
    /**
     * @param {String} messageId 
     * @returns { "no giveaway" | "no guild" | "no channel" | "no message" | "no winner" | "already ended" | String[] }
     */
    async end(messageId) {
        let gw = this.giveaways.get(messageId);
        if (!gw && this.ended.has(messageId)) return 'already ended';
        if (!gw) return 'no giveaway'

        const guild = this.client.guilds.cache.get(gw.guild_id);
        if (!guild) return 'no guild';

        const channel = guild.channels.cache.get(gw.channel_id);
        if (!channel) return 'no channel';

        const message = await channel.messages.fetch(messageId);
        if (!message) return 'no message';

        if (!gw.ended == false) {
            gw = this.formatToObject(gw);
        };

        let winners = await this.roll(gw, { guild, channel, message });
        const embed = embeds.ended(gw, winners);

        gw.winners = winners;
        message.edit({ embeds: [ embed ], components: [] }).catch((e) => {console.log(e)});
        channel.send({ reply: { messageReference: message }, embeds: [ embeds.winners(winners, this.getUrl(gw)) ] }).catch((e) => {console.log(e)});
        gw.ended = true;

        let sql = this.createQuery(this.formatToSql(gw), true);
        this.db.query(sql, (err) => {
            if (err) throw err;
        });

        this.giveaways.delete(messageId);
        this.ended.set(messageId, gw);

        return winners;
    }
    checkGw() {
        this.giveaways.forEach((gw) => {
            if (!this.timeout.has(gw.message_id)) {
                setTimeout(() => {
                    this.end(gw.message_id);
                    this.timeout.delete(gw.message_id);
                }, gw.endsAt - Date.now());
                this.timeout.set(gw.message_id, gw);
            }
        })
    }
    addParticipation(userId, data) {
        let gw = data;
        if (typeof gw.participants == 'string') gw.participants = JSON.parse(gw.participants);
        gw.participants.push(userId);

        let sql = this.createQuery(this.formatToSql(gw), true);
        
        this.db.query(sql, (err) => {
            if (err) throw err;
        });
        
        this.giveaways.set(gw.message_id, gw);
        return gw;
    }
    removeParticipation(userId, data) {
        let gw = data;
        if (typeof gw.participants == 'string') gw.participants = JSON.parse(gw.participants);
        let index = gw.participants.indexOf(userId);
        gw.participants.splice(index, 1);

        let sql = this.createQuery(this.formatToSql(gw), true);
        this.db.query(sql, (err) => {
            if (err) throw err;
        });

        this.giveaways.set(gw.message_id, gw);
        return gw;
    }
    setOnInteraction() {
        this.client.on('interactionCreate', /** @param {ButtonInteraction} interaction */ (interaction) => {
            if (interaction.isButton()) {
                if (interaction.customId == 'gw-participate') {
                    let gw = this.giveaways.get(interaction.message.id);
                    if (!gw) return;

                    if (gw.participants.includes(interaction.user.id)) return interaction.reply({ embeds: [ embeds.alreadyParticipate(this.getUrl(gw)) ], ephemeral: true }).catch(() => {});

                    const check = this.checkIfValidEntry(interaction.member, gw);
                    interaction.reply({ embeds: [ check.embed ], ephemeral: true }).catch(() => {});

                    if (check.state == true) {
                        gw = this.addParticipation(interaction.user.id, gw);
                        
                        let dataset = {
                            reward: gw.reward,
                            winnerCount: gw.winnerCount,
                            participants: JSON.parse(gw.participants),
                            winners: JSON.parse(gw.winners),
                            requiredRoles: JSON.parse(gw.required_roles),
                            deniedRoles: JSON.parse(gw.denied_roles),
                            bonusRoles: JSON.parse(gw.bonus_roles),
                            time: parseInt(gw.endsAt) - Date.now(),
                            hosterId: gw.hoster_id
                        };

                        interaction.message.edit({ embeds: [ embeds.giveaway(dataset) ] }).catch(() => {});
                    };
                };
                if (interaction.customId == 'gw-unparticipate') {
                    let gw = this.giveaways.get(interaction.message.id);
                    if (!gw) return;

                    if (!gw.participants.includes(interaction.user.id)) return interaction.reply({ embeds: [ embeds.notParticipated(this.getUrl(gw)) ], ephemeral: true }).catch(() => {});
                    gw = this.removeParticipation(interaction.user.id, gw);

                    let dataset = {
                        reward: gw.reward,
                        winnerCount: gw.winnerCount,
                        participants: gw.participants,
                        winners: gw.winners,
                        requiredRoles: gw.required_roles,
                        bonusRoles: gw.bonus_roles,
                        deniedRoles: gw.denied_roles,
                        time: Date.now() - parseInt(gw.date),
                        channel: interaction.channel,
                        hosterId: gw.hoster_id
                    };

                    interaction.message.edit({ embeds: [ embeds.giveaway(this.formatToObject(dataset)) ] }).catch(() => {});
                    interaction.reply({ embeds: [ embeds.removeParticipation(this.getUrl(gw)) ] }).catch(() => {});
                }
            };
        });
    }
    /**
     * @param {{ guildId: String, messageId: String }} data
     * @description Search a specific giveaway in the server
     * @returns {{reward: String, hoster_id: String, guild_id: String, channel_id: String, message_id: String, winnerCount: Number, winners: String[], ended: Boolean, participants: String[], required_roles: String[], bonus_roles: String[], denied_roles: String[], endsAt: Number}}
     */
    fetch(data) {
        let id = data.messageId;
        let gId = data.guildId;
        if (!id || !gId) return 'invalid data';

        let gw = this.giveaways.find(x => x.guild_id == gId && x.message_id == id);
        if (!gw) gw = this.ended.find(x => x.guild_id == gId && x.message_id == id);

        if (!gw) return 'giveaway not found';
        return gw;
    }
    /**
     * @description Returns the list of all giveaways in the server
     * @param {String} guildId 
     * @returns {{reward: String, hoster_id: String, guild_id: String, channel_id: String, message_id: String, winnerCount: Number, winners: String[], ended: Boolean, participants: String[], required_roles: String[], bonus_roles: String[], denied_roles: String[], endsAt: Number}[]}
     */
    list(guildId) {
        if (!guildId) return 'invalid data';

        let giveaways = [];
        const notEnded = this.giveaways.filter(x => x.guild_id === guildId).toJSON();
        const ended = this.ended.filter(x => x.guild_id === guildId).toJSON();

        giveaways = giveaways.concat(notEnded);
        giveaways = giveaways.concat(ended);

        return giveaways;
    }
    delete(guildId, messageId) {
        if (!guildId || !messageId) return 'invalid data';
        const giveaway = this.fetch({ guildId, messageId });

        if (!giveaway) return 'giveaway not found';

        this.db.query(`DELETE FROM giveaways WHERE message_id="${messageId}"`, (err, req) => {
            if (err) throw err;

            this.fillCache();
        });

        return 'deleted';
    }
    resetCache() {
        this.giveaways = new Collection();
        this.ended = new Collection();
    }
    fillCache() {
        this.db.query(`SELECT * FROM giveaways`, (err, req) => {
            if (err) throw err;
            this.resetCache();

            for (const RawGw of req) {
                let gw = this.formatToObject(RawGw);

                if (gw.ended == true || gw.date <= Date.now()) {
                    this.ended.set(gw.message_id, gw);
                } else {
                    this.giveaways.set(gw.message_id, gw);
                };
            };
        })
    }
    init() {
        this.fillCache();
        setInterval(() => {
            this.checkGw();
        }, 10000);
        this.setOnInteraction();

        console.log(`Giveaways Manager is ready !`);
    }
};

module.exports = GiveawaysManager;