const Discord = require('discord.js');
const data = require('./data/data.json');

module.exports = {
    package: () => {
        return {
            commands: require('./data/commands.js'),
            data: require('./data/data.json'),
            colors: require('./colors.json'),
            emojis: require("./emojis.json"),
            perms: require('./data/perms.json'),
            embeds: require('./embeds')
        }
    },
    isDev: (id) => data.devs.filter(x => x.id == id).length == 1,
    /**
     * @param {{ max: Number, min: Number } | Number} data 
     * @param {?Number} minParam
     */
    random: (data, minParam) => {
        let max = 100;
        let min = 0;

        if (!isNaN(minParam)) min = minParam;
        if (typeof data == "number") max = data;
        if (typeof data == "object") {
            if (typeof data.max == "number") {
                max = data.max;
            };
            if (typeof data.min == "number") {
                min = data.min;
            };
        } else if (typeof data == "number") {
            max = data;
        };

        if (max < min) {
            let oldMax = max;
            max = min;
            min = oldMax;
        };

        return Math.floor(Math.random() * (max - min)) + min;
    },
    /**
     * @param {Discord.Message} message 
     * @param {String | Discord.MessageEmbed} content 
     * @param {? Discord.MessageActionRow} row
     * @returns {Discord.Message}
     */
    reply: async(message, content, row) => {
        let data = {
            reply: {
                messageReference: message
            }
        };
        if (typeof content == "string") data.content = content
        else data.embeds = [ content ];

        if (row !== undefined && row !== null) data.components = row;
            return await message.channel.send(data).catch(() => {});
    }
}