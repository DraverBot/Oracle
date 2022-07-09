const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'dev',
    description: "dev",
    aliases: [],
    permissions: [],
    private: true,
    dm: true,
    cooldown: 0
};

module.exports.run = (message, args, client, prefix) => {
    const id = "807287341399539733";
    const gid = "930858671322316820";


    let data = {};

    client.db.query(`SELECT * FROM levels WHERE guild_id="${gid}" AND user_id="${id}"`, (err, req) => {
        if (err) console.log(err);

        data = req[0];

        for (let i = 0; i<500;i++) {
            data.total = parseInt(data.total) + 1;
            data.messages = parseInt(data.messages) + 1;
            
            if (data.messages >= data.objectif) {
                data.level = parseInt(data.level) + 1;
                data.messages = 0;
                data.objectif = parseInt(data.objectif) + parseInt(parseInt(parseInt(data.objectif) / 3).toFixed(0));
            };
        };
    
        client.db.query(`UPDATE levels SET total="${data.total}", messages="${data.messages}", objectif="${data.objectif}", level="${data.level}" WHERE guild_id="${gid}" AND user_id="${id}"`, (e) => {if (e) console.log(e)});
    });
}