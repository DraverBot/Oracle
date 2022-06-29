const Discord = require('discord.js');
const client = new Discord.Client({
    intents: Object.keys(Discord.Intents.FLAGS),
    partials: ['CHANNEL', 'GUILD_MEMBER', 'GUILD_SCHEDULED_EVENT', 'MESSAGE', 'REACTION', 'USER']
});

const fs = require('fs');
fs.readdirSync('./events').filter(x => x.endsWith('.js')).forEach((fileName) => {
    let props = require(`./events/${fileName}`);

    client.on(props.event, props.execute);
});

const { token } = require('./assets/data/data.json');
client.login(token).catch((err) => {
    throw err;
});