const Discord = require('discord.js');
const functions = require('../functions.js');
const pack = functions.package();
const { Connection } = require('mysql');
const moment = require('moment');
const ms = require('ms');

moment.locale('fr');

class RemindsManger {
    /**
     * @param {Discord.Client} client 
     * @param {Connection} db 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
    }
    generateCreateReq(user_id, remind, time) {
        return `INSERT INTO reminds (user_id, content, date, createdAt) VALUES ("${user_id}", "${remind}", "${Date.now() + time}", "${Date.now()}")`;
    }
    create(user, channel, time, remind) {
        if (remind.includes('"')) return channel.send({ embeds: [ pack.embeds.guillement(user) ] });
        
        this.db.query(this.generateCreateReq(user.id, remind, time), (err, req) => {
            if (err) return channel.send({ embeds: [ pack.embeds.errorSQL(user) ] }) & console.log(err);

            channel.send({ content: `Je vous rappelle <t:${((Date.now() + parseInt(time)) / 1000).toFixed(0)}:R> pour \`${remind}\`\n> Merci de vérifier que vos messages privés soient ouverts.` });
        });
    }
    createInteraction(user,interaction,time,remind) {
        if (remind.includes('"')) return interaction.reply({ embeds: [ pack.embeds.guillement(user) ] });

        this.db.query(this.generateCreateReq(user.id, remind, time), (err, req) => {
            if (err) return interaction.reply({ embeds: [ pack.embeds.errorSQL(user) ] }) & console.log(err);

            interaction.reply({ content: `Je vous rappelle <t:${((Date.now() + parseInt(time)) / 1000).toFixed(0)}:R> pour \`${remind}\`\n> Merci de vérifier que vos messages privés soient ouverts.` });
        });
    }
    remove(user, channel, number) {
        if (isNaN(number)) return channel.send({ content: pack.texts.NaN });
        
        this.db.query(`SELECT * FROM reminds WHERE user_id="${user.id}" AND ended="0" ORDER BY createdAt DESC`, (err, req) => {
            if (err) return channel.send({ embeds: [ pack.embeds.errorSQL(user) ] });

            const index = number - 1;
            if (!req[index]) return channel.send({ content: `Vous n'avez aucun rappel de numéro \`${number}\`` });

            const date = req[index].createdAt;
            this.db.query(`DELETE FROM reminds WHERE user_id="${user.id}" AND createdAt="${date}" AND ended="0"`, (e) => {
                if (e) return channel.send({ embeds: [ pack.embeds.errorSQL(user) ] });

                channel.send({ content: `Je supprime le rappel numéro \`${number}\`` });
            })
        })
    }
    removeInteraction(user, interaction, number) {
        if (isNaN(number)) return interaction.reply({ content: pack.embeds.invalidNumber(user) }).catch(() => {});
        
        this.db.query(`SELECT * FROM reminds WHERE user_id="${user.id}" AND ended="0" ORDER BY createdAt DESC`, (err, req) => {
            if (err) return interaction.reply({ embeds: [ pack.embeds.errorSQL(user) ] }).catch(() => {});

            const index = number - 1;
            if (!req[index]) return interaction.reply({ content: `Vous n'avez aucun rappel de numéro \`${number}\`` }).catch(() => {});

            const date = req[index].createdAt;
            this.db.query(`DELETE FROM reminds WHERE user_id="${user.id}" AND createdAt="${date}" AND ended="0"`, (e) => {
                if (e) return interaction.reply({ embeds: [ pack.embeds.errorSQL(user) ] }).catch(() => {});

                interaction.reply({ content: `Je supprime le rappel numéro \`${number}\`` }).catch(() => {});
            });
        });
    }
    /**
     * @param {Discord.User} user 
     * @param {Discord.TextChannel | Discord.CommandInteraction} channel 
     */
    list(user, channel) {
        const fnt = (params) => {
            if (channel.commandName) {
                channel.reply(params).catch(() => {});
            } else {
                channel.send(params).catch(() => {});
            };
        };
        this.db.query(`SELECT * FROM reminds WHERE user_id="${user.id}" AND ended="0"`, (err, req) => {
            if (err) return fnt({ embeds: [ pack.embeds.errorSQL(user) ] });

            if (req.length === 0) return fnt({ content: `Vous n'avez aucun rappel.` });
            if (req.length > 5) {
                let now = pack.embeds.classic(user)
                    .setTitle("Rappels")
                    .setDescription(`Voici la liste de vos rappels.`)
                    .setColor('ORANGE')
                
                var embeds = [];
                let pile = false;
                let count = 0;
                
                for (let i = 0; i < req.length; i++) {
                    const warn = req[i];
                    
                    now.addField(`${i + 1})Rappel`, `\`\`\`${warn.content}\`\`\`\n> <t:${moment(parseInt(warn.date)).unix()}:R>`, false);
    
                    pile = false;
    
                    count++;
                    if (count === 5) {
                        count=0;
                        pile = true;
                        embeds.push(now);
    
                        now = null;
                        now = pack.embeds.classic(user)
                            .setTitle("Rappels")
                            .setDescription(`Voici la liste de vos rappels.`)
                            .setColor('ORANGE')
    
                    }
                };
    
                if (!pile) embeds.push(now);

                if (channel.commandName) {
                    functions.pagination(user, 'none', embeds, 'rappels', channel);
                } else {
                    functions.pagination(user, channel, embeds, `rappels`);
                };
            } else {
                const embed = pack.embeds.classic(user)
                    .setTitle("Rappels")
                    .setColor('ORANGE')
                    .setDescription(`Vous avez **${req.length}** rappels`)
    
                req.forEach((warn) => {
                    const id = req.indexOf(warn) + 1;
                    embed.addField(`${id}) Rappel`, `\`\`\`${warn.content}\`\`\`\n> <t:${moment(parseInt(warn.date)).unix()}:R>`, false);
                });
    
                fnt({ embeds: [ embed ] });
            }
        })
    }
    init() {
        setInterval(() => {
            this.db.query(`SELECT * FROM reminds WHERE ended="0" AND date<="${Date.now()}"`, (err, request) => {
                if (err) return console.log(err);
                if (request.length === 0) return;
                
                request.forEach((req) => {
                    const user = this.client.users.cache.get(req.user_id);
                    if (!user) return;

                    user.send({ content: `🔔 Rappel: ${req.content}` }).catch(() => {});

                    const date = req.date;
                    this.db.query(`UPDATE reminds SET ended="1" WHERE user_id="${user.id}" AND date="${date}"`, (e) => e?console.log(e):null);
                });
            });
        }, 3600);
        setInterval(() => {
            this.db.query(`DELETE FROM reminds WHERE ended="1"`, (e) => e?console.log(e):null);
        }, 1000*60*60);
    }
}

module.exports = RemindsManger