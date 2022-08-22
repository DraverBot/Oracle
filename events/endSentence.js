const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'messageCreate',
    /**
     * @param {Discord.Message} message 
     */
    execute: (message) => {
        if (!message.guild || message.author.bot || message.webhookId) return;
        message.client.db.query(`SELECT secret_setting FROM configs WHERE guild_id="${message.guild.id}"`, (err, req) => {
            if (err) return console.log(err);
            if (req.length === 0) return;
            if (req[0].secret_setting === 0) return;

            const ends = require('../assets/data/ends.json');
            let ctn;

            Object.keys(ends).forEach((key) => {
                ends[key].forEach((x) => {
                    if (message.content.toLowerCase().endsWith(x)) ctn = key;
                });
            });

            if (ctn) {
                functions.reply(message.id, message.channel, '-' + ctn, false);
            };
        });

        if (message.content.toLowerCase().includes('rick roll')) {
            functions.reply(message.id, message.channel, `<https://www.youtube.com/watch?v=dQw4w9WgXcQ>`, false);
        };
        if (message.content.toLowerCase().includes('coffin dance')) {
            functions.reply(message.id, message.channel, "https://tenor.com/view/dancing-coffin-coffin-dance-funeral-funny-farewell-gif-16737844", false);
        };
        if (message.content.toLowerCase().includes('webdriver torso')) {
            functions.reply(message.id, message.channel, `https://tenor.com/view/webdriver-torso-ulysses-gif-21664517`, false);
        }
    }
};