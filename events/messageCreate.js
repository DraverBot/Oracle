const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'messageCreate',
    /**
     * @param {Discord.Message} message 
     */
    execute: (message) => {
        const client = message.client;

        if (!message.guild) return;
        if (message.webhookId) return;

        client.db.query(`SELECT * FROM configs WHERE interchat_enable="1"`, (err, req) => {
            return;
            if (err) return console.log(err);
            
            if (req.find((x) => x.guild_id === message.guild.id)) {
                const data = req.find((x) => x.guild_id === message.guild.id);

                if (data.interchat_channel !== message.channel.id) return;

                req.forEach((gdata) => {
                    if (gdata.guild_id === message.guild.id) return;
                        
                    const guild = client.guilds.cache.get(gdata.guild_id);
                    if (!guild) return;
                    
                    const channel = guild.channels.cache.get(gdata.interchat_channel);
                    if (!channel) return console.log('no_channel');

                    const object = {
                        username: message.member.nickname ? message.member.nickname : message.author.username,
                        avatarURL: message.author.displayAvatarURL({ dynamic: true })
                    };

                    if (message.mentions.everyone) return message.author.send({ embeds: [ package.embeds.classic(message.author)
                        .setTitle("Pas de mention everyone")
                        .setDescription(`Oops, vous ne pouvez pas mentionner everyone dans un inter-chat.`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});

                    if (message.content) object.content = message.content;
                    if (message.embeds) object.embeds = message.embeds;

                    client.db.query(`SELECT * FROM webhooks WHERE guild_id="${gdata.guild_id}"`, (error, request) => {
                        if (error) return console.log(error);

                        if (request.length === 0) {
                            channel.createWebhook(message.member.nickname ? message.member.nickname : message.author.username, {
                                avatar: message.author.displayAvatarURL({ dynamic: true })
                            })
                            .then(/** @param {Discord.Webhook} webhook */ (webhook) => {                        
                                webhook.send(object)
                                .catch((err) => console.log(err))
                                .then(() => {
                                    client.db.query(`INSERT INTO webhooks (guild_id, id, token) VALUES ("${gdata.guild_id}", "${webhook.id}", "${webhook.token}")`, (e) => {
                                        if (e) console.log(e);
                                    })
                                })
                            })
                        } else {
                            const webhook = new Discord.WebhookClient({ url: `https://discord.com/api/webhooks/${request[0].id}/${request[0].token}` });

                            webhook.send(object);
                        }
                    })
                })
            }
        });

        if (message.author.bot) return;

        client.db.query(`SELECT level_message, level_channel FROM configs WHERE guild_id="${message.guild.id}"`, (err, req) => {
            if (err) return console.log(err);

            if (req.length === 0) return;
            const gdata = req[0];

            if (!message.client.ModulesManager.checkModule({ module: 'levels', guildId: message.guild.id })) return;
            client.db.query(`SELECT * FROM levels WHERE guild_id="${message.guild.id}" AND user_id="${message.author.id}"`, (error, request) => {
                if (error) return console.log(error);

                if (request.length === 0) {
                    client.db.query(`INSERT INTO levels (guild_id, user_id) VALUES ("${message.guild.id}", "${message.author.id}")`, (e) => {if (e) console.log(e)});
                } else {
                    const data = request[0];

                    data.total = parseInt(data.total) + 1;
                    data.messages = parseInt(data.messages) + 1;

                    if (data.messages >= data.objectif) {
                        data.level = parseInt(data.level) + 1;
                        data.messages = 0;
                        data.objectif = parseInt(data.objectif) + parseInt(parseInt(parseInt(data.objectif) / 3).toFixed(0));

                        const channel = message.guild.channels.cache.get(gdata.level_channel) || message.channel;

                        let text = (gdata.level_message || "Bravo {user.mention} ! Tu passes au niveau **{user.level}**");
                        const replace = (x, y) => text = text.replace(x, y);

                        replace(/{user.mention}/g, `<@${message.author.id}>`);
                        replace(/{user.name}/g, message.author.username);
                        replace(/{user.tag}/g, message.author.discriminator);
                        replace(/{user.id}/g, message.author.id);
                        replace(/{user.level}/g, data.level);

                        channel.send({ content: text }).catch(() => {});
                        if (message.client.ModulesManager.checkModule({ module: 'economy', guildId: message.guild.id })) {
                            message.client.CoinsManager.addCoins({ user_id: message.author.id, guild_id: message.guild.id }, parseInt(data.level) * 100);
                            channel.send({ embeds: [ package.embeds.classic(message.author)
                                .setTitle("Récompense de niveau")
                                .setDescription(`<@${message.author.id}> a récupéré ${parseInt(data.level) * 100} ${package.configs.coins} pour son passage au niveau supérieur.`)
                                .setColor(message.guild.me.displayHexColor)
                            ] }).catch(() => {});
                        };
                    };

                    client.db.query(`UPDATE levels SET total="${data.total}", messages="${data.messages}", objectif="${data.objectif}", level="${data.level}" WHERE guild_id="${message.guild.id}" AND user_id="${message.author.id}"`, (e) => {if (e) console.log(e)});
                };
            });
        });
    }
};