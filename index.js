const Discord = require('discord.js');
const fs = require('fs');

const { IntentsBitField } = require('discord.js');
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'],
    intents: [ IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages,IntentsBitField.Flags.GuildMessageReactions, IntentsBitField.Flags.DirectMessages, IntentsBitField.Flags.GuildMembers, IntentsBitField.Flags.DirectMessageReactions, IntentsBitField.Flags.GuildBans, IntentsBitField.Flags.GuildVoiceStates ]
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

fs.readdirSync('./commands').filter(x => x.startsWith('.')).forEach((dirName) => {
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

const tokens = require('./assets/data/tokens.json');

let token = configs.beta === true ? tokens.beta_token : tokens.token;
client.login(token);