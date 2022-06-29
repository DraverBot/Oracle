const Discord = require('discord.js');
const data = require('./data/data.json');

module.exports = {
    package: () => {
        return {
            commands: require('./data/commands.js'),
            data: require('./data/data.json'),
            colors: require('./colors.json'),
            emojis: require("./emojis.json"),
            perms: required('./data/perms.json')
        }
    },
    isDev: (id) => data.devs.filter(x => x.id == id).length == 1
}