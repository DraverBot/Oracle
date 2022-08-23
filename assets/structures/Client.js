const { Client, IntentsBitField } = require('discord.js');
const mysql = require('mysql');

class ClientClass {
    #_client;
    #db;
    constructor(token, databaseData) {
        this.#_client = new Client({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildBans,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.GuildEmojisAndStickers,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildWebhooks
            ],
            partials: [ 'MESSAGE', 'REACTION', 'CHANNEL', 'USER' ]
        });
        this.#token = token;
        this.#db = new mysql.createConnection(databaseData);
    }
    get client() {
        return this.#_client
    }
    createClient() {
        this.#db.connect((error) => {
            if (error) throw error;
        });

        this.#_client.db = this.#db;
    }
    setEvent()
};

module.exports = ClientClass;