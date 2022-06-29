const { Client } = require('discord.js');
const fs = require('fs');
const connectDB = require('../assets/db/connect');
const commands = require('../assets/data/commands');

module.exports = {
    event: 'ready',
    /**
     * @param {Client} client 
     */
    execute: (client) => {
        connectDB(client);

        fs.readdirSync('./commands').forEach((dir) => {
            fs.readdirSync(`./commands/${dir}`).filter(x => x.endsWith('.js')).forEach((fileName) => {
                let props = require(`../commands/${dir}/${fileName}`);

                commands.set(props.configs.name, props);
                client.application.commands.create(props.configs);
            });
        });
    }
};