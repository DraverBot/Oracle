const Discord = require('discord.js');
const functions = require('../functions.js');
const embeds = functions.package().embeds;
const mysql = require('mysql');
const moment = require('moment');

moment.locale('fr'); 

class GiveawayManager {
    /**
     * @param {Discord.Client} client 
     * @param {mysql.Connection} db 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
    }
    generateEmbed(data, guild) {
        const hoster = (guild.members.cache.get(data.hoster_id) || guild.me).user;

        const embed = embeds.classic(hoster)
            .setTitle(":tada: GIVEAWAY :tada:")
            .setTimestamp(new Date(parseInt(data.endsAt)).toISOString())
            .setDescription(`Appuyez sur le boutton pour participer !\n\nRécompense: \`${data.reward}\`\nOffert par: <@${data.hoster_id}>\n${data.winnerCount} gagnan${data.winnerCount > 1 ? "ts" : "t"}\nFinit le <t:${(parseInt(data.endsAt) / 1000).toFixed(0)}:R>`)
            .setColor(guild.me.displayHexColor)
            
        if (data.endsAt - Date.now() < 10000) embed.setColor('#ff0000').setTitle(":tada: **G I V E A W A Y** :tada:");
        
        return embed
    }
    /**
     * @param {objectGW} data 
     * @param {Discord.Guild} guild 
     */
    generateEndedEmbed(data, guild) {
        const hoster = (guild.members.cache.get(data.hoster_id) || guild.me).user;

        const embed = embeds.classic(hoster)
            .setTitle(":tada: **GIVEAWAY TERMINÉ** :tada:")
            .setTimestamp(new Date(parseInt(data.endsAt)).toISOString())
            .setColor(guild.me.displayHexColor)
            .setDescription(`Giveaway terminé !\n\nRécompense: \`${data.reward}\`\nOffert par <@${hoster.id}>\n${data.winnerCount} gagnan${data.winnerCount > 1 ? 'ts' : "t"}`)

        return embed;
    }
    edit(data, guild) {
        const channel = guild.channels.cache.get(data.channel_id);
        if (!channel) return;

        const msg = channel.messages.cache.get(data.message_id);
        if (!msg) return;

        const embed = this.generateEmbed(data, guild);
        msg.edit({ embeds: [ embed ] }).catch((e) => console.log(e));
    }
    /**
     * @param {Discord.Guild} guild 
     * @param {Discord.TextChannel}
     * @param {Discord.User} user
     * @param {String} reward 
     * @param {Number} winnerCount 
     * @param {Number} time 
     */
    start(guild, channel, user, reward, winnerCount, time) {
        const data = {
            endsAt: time + Date.now(),
            hoster_id: user.id,
            reward: reward,
            winnerCount: winnerCount
        };

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('giveaway-participate')
                    .setLabel('Participer')
                    .setEmoji('🎉')
                    .setStyle('SUCCESS')
            )

        const embed = this.generateEmbed(data, guild);
        channel.send({ embeds: [ embed ], components: [ row ] }).then((msg) => {
            this.db.query(`INSERT INTO giveaways (guild_id, channel_id, message_id, hoster_id, reward, endsAt, winnerCount, path) VALUES ("${guild.id}", "${channel.id}", "${msg.id}", "${user.id}", "${reward}", "${data.endsAt}", "${winnerCount}", "https://discord.com/channels/${guild.id}/${channel.id}/${msg.id}")`, (err, req) => {
                if (err) return console.log(err) & channel.send({ embeds: [ embeds.errorSQL(user) ] });
            });
        })
    }
    /**
     * @param {Discord.Guild} guild
     * @param {objectGW} data
     */
    end(guild, data) {
        const channel = guild.channels.cache.get(data.channel_id);
        if (!channel) return;

        this.db.query(`SELECT user_id FROM gw_participants WHERE message_id="${data.message_id}" AND guild_id="${guild.id}"`, (err, req) => {
            if (err) return channel.send({ content: "Une erreur s'est produite lors de la récupération des participants." }) & console.log(err);

            const users = req
            this.db.query(`UPDATE giveaways SET ended="1" WHERE message_id="${data.message_id}" AND guild_id="${guild.id}"`, (e) => {
                if (e) console.log(e);
            });
            
            if (users.length === 0) return functions.lineReply(data.message_id, channel, `Je n'ai pu trouver aucun gagnant pour ce giveaway.`);
            
            let winners = [];
            for (let i = 0; i < data.winnerCount; i++) {
                const possible = users.filter(x => !winners.includes(x));
                if (!possible.length === 0) return;

                const index = Math.floor(Math.random() * users.length);
                const id = users[index].user_id;

                winners.push(id);
            };

            let pluriel = data.winnerCount > 1;

            this.edit(data, guild);
            functions.lineReply(data.message_id, channel, `Giveaway terminé ! L${pluriel ? 'es' : 'e'} gagnan${pluriel ? 'ts sont' : "t est"} ${winners.map(u => `<@${u}>`).join(', ')} !\n${pluriel ? 'vous avez' : 'tu as'} gagné **${data.reward}**`);

        });
    }
    /**
     * @param {Discord.Guild} guild 
     * @param {objectGW} data 
     */
    reroll (guild, data) {
        const channel = guild.channels.cache.get(data.channel_id);
        if (!channel) return;

        this.db.query(`SELECT user_id FROM gw_participants WHERE message_id="${data.message_id}" AND guild_id="${guild.id}"`, (err, req) => {
            if (err) return channel.send({ content: "Une erreur s'est produite lors de la récupération des participants." }) & console.log(err);

            const users = req
            
            if (users.length === 0) return functions.lineReply(data.message_id, channel, `Je n'ai pu trouver aucun gagnant pour ce giveaway.`);
            
            let winners = [];
            for (let i = 0; i < data.winnerCount; i++) {
                const possible = users.filter(x => !winners.includes(x));
                if (!possible.length === 0) return;

                const index = Math.floor(Math.random() * users.length);
                const id = users[index].user_id;

                winners.push(id);
            };

            let pluriel = data.winnerCount > 1;

            this.edit(data, guild);
            functions.lineReply(data.message_id, channel, `L${pluriel ? 'es' : 'e'} nouvea${pluriel ? 'ux' : 'u'} gagnan${pluriel ? 'ts sont' : "t est"} ${winners.map(u => `<@${u}>`).join(', ')} !\n${pluriel ? 'vous avez' : 'tu as'} gagné **${data.reward}**`);
        });
    }
    /**
     * @param {Discord.TextChannel} channel
     * @param {Discord.User} user
     */
    list(channel, user) {
        const guild = channel.guild;

        this.db.query(`SELECT * FROM giveaways WHERE guild_id="${guild.id}" AND endsAt>"${Date.now()}"`, (err, req) => {
            if (err) return channel.send({ embeds: [ embeds.errorSQL(user) ] });

            if (req.length === 0) return channel.send({ embeds: [ embeds.classic(user)
                .setTitle("Pas de giveaways")
                .setDescription(`Il n'y a aucun giveaway en cours sur ce serveur.`)
                .setColor('#ff0000')
            ] });
    
            const original = require('./functions').package().embeds.classic(user)
                .setTitle("Giveaways")
                .setDescription(`Voici la liste des giveaways sur \`${guild.name}\`.\nIl y a actuellement **${req.length}** giveawa${req.length > 1 ? "ys" : "y"} en cours sur le serveur.`)
                .setColor('ORANGE')
            
            if (req.length > 5) {
                let now = original;
                
                let embeds = [];
                let pile = false;
                let count = 0;
                
                for (let i = 0; i < req.length; i++) {
                    const warn = req[i];
                    
                    now.addField(`Giveaway`, `Offert par <@${warn.hoster_id}>\n> Récompense: \`${warn.reward}\`\n> Finit: ${moment(parseInt(warn.endsAt)).format('DD/MM/YYYY - hh:mm:ss')}\nDans <#${warn.channel_id}> avec ${warn.winnerCount} gagnan${warn.winnerCount > 1 ? "ts" : "t"}`, false);
    
                    pile = false;
    
                    count++;
                    if (count === 5) {
                        count=0;
                        pile = true;
                        embeds.push(now);
    
                        now = null;
                        now = embeds.classic(user)
                            .setTitle("Giveaways")
                            .setDescription(`Voici la liste des giveaways sur \`${guild.name}\`.`)
                            .setColor('ORANGE')
    
                    }
                };
    
                if (!pile) embeds.push(now);
                
                functions.pagination(user, channel, embeds, `giveaways`);
            } else {
                const embed = original;
    
                req.forEach((warn) => {    
                    embed.addField(`Giveaway`, `Offert par <@${warn.hoster_id}>\n> Récompense: \`${warn.reward}\`\n> Finit: ${moment(parseInt(warn.endsAt)).format('DD/MM/YYYY - hh:mm:ss')}\nDans <#${warn.channel_id}> avec ${warn.winnerCount} gagnan${warn.winnerCount > 1 ? "ts" : "t"}`, false);
                });
    
                channel.send({ embeds: [ embed ] });
            }
        })
    }
    updateAll(guild) {
        this.db.query(`SELECT * FROM giveaways WHERE guild_id="${guild.id}" AND ended="0"`, (err, req) => {
            if(err) return console.log(err);

            req.forEach((x) => {
                if (parseInt(x.endsAt) <= Date.now()) {
                    this.end(guild, x);
                } else {
                    this.edit(x, guild);
                }
            });
        });
    }
    init() {
        this.client.on('interactionCreate', (interaction) => {
            if (!interaction.isButton()) return;

            if (!interaction.customId === 'giveaway-participate') return;

            this.db.query(`SELECT guild_id FROM giveaways WHERE guild_id="${interaction.guild.id}" AND channel_id="${interaction.channel.id}" AND message_id="${interaction.message.id}" AND ended="0"`, (err, req) => {
                if (err) return interaction.reply({ embeds: [ embeds.errorSQL(interaction.user) ], ephemeral: true }) & console.log(err);
                const data = req[0];

                if (!data) return;

                this.db.query(`SELECT user_idFROM gw_participants WHERE message_id="${interaction.message.id}" AND guild_id="${interaction.guild.id}" AND user_id="${interaction.user.id}"`, (error, request) => {
                    if (error) return interaction.reply({ embeds: [ embeds.errorSQL(interaction.user) ], ephemeral: true }) & console.log(error);

                    if (request.length === 0) {
                        this.db.query(`INSERT INTO gw_participants (guild_id, channel_id, message_id, user_id) VALUES ("${interaction.guild.id}", "${interaction.channel.id}", "${interaction.message.id}", "${interaction.user.id}")`);
                        interaction.reply({ content: `J'ai enregistré votre participation`, ephemeral: true });
                        return;
                    } else {
                        this.db.query(`DELETE FROM gw_participants WHERE guild_id="${interaction.guild.id}" AND message_id="${interaction.message.id}" AND user_id="${interaction.user.id}"`);
                        
                        interaction.reply({ content: `J'annule votre participation à ce giveaway`, ephemeral: true });
                    };
                });
            });
        });

        setInterval(() => {
            this.db.query(`SELECT * FROM giveaways WHERE ended="0"`, (err, req) => {
                if (err) return console.log(err);

                req.forEach(/**@param {objectGW} gw */(gw) => {
                    const guild = this.client.guilds.cache.get(gw.guild_id);
                    if (!guild) return;

                    this.updateAll(guild);
                });
            });
        }, 10000);
    }
};

module.exports = GiveawayManager;