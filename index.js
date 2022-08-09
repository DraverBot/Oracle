const Discord = require('discord.js');
const fs = require('fs');

const { Intents } = require('discord.js');

const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'],
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
});

const configs = require('./assets/data/data.json');
const connect = require('./connect_db');

client.cooldowns = new Discord.Collection();

client.db = connect.connect();

fs.readdirSync('./events').filter(x => x.endsWith('.js')).forEach((fileName) => {
    let prop = require(`./events/${fileName}`);
    client.on(prop.event, prop.execute);
});

module.exports.client = client;
var obj = {};
fs.readdirSync('./commands').forEach((dirName) => {
    obj[dirName] = [];
    fs.readdirSync(`./commands/${dirName}`).filter((x) => x.endsWith('.js')).forEach((fileName) => {
        let commandFile = require(`./commands/${dirName}/${fileName}`);
        obj[dirName].push({
            name: commandFile.help.name,
            help: commandFile.help,
            path: `./commands/${dirName}/${fileName}`
        });
    });
});

fs.writeFileSync(`./assets/data/commands.json`, JSON.stringify(obj, '', 1));

let token = configs.beta === true ? configs.beta_token : configs.token;
client.login(token);