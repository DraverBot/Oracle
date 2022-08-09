const Discord = require('discord.js');
const functions = require('../assets/functions.js');
const package = functions.package();

module.exports = {
    event: 'messageReactionAdd',
    /**
     * @param {Discord.MessageReaction} reaction 
     * @param {Discord.User} user 
     */
    execute: (reaction, user) => {
        if (!reaction.message || !reaction.message.guild || user.bot) return;

        const client = reaction.client;

        const message = reaction.message;
        const channel = message.channel;
        const guild = message.guild;

        client.db.query(`SELECT * FROM rolesreact WHERE guild_id="${guild.id}" AND channel_id="${channel.id}" AND message_id="${message.id}" AND emoji="${reaction.emoji.identifier}"`, (err, req) => {
            if (err) return console.log(err);
            if (req.length === 0) return;

            const data = req[0];
            const role = guild.roles.cache.get(data.role_id);
            if (!role) return;

            const member = guild.members.cache.get(user.id);
            member.roles.add([ role ]).catch(() => console.log);
        });
    }
};