const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'guildMemberUpdate',
    /**
     * @param {Discord.GuildMember} before 
     * @param {Discord.GuildMember} after 
     */
    execute: (before, after) => {
        if (before.roles.cache.size !== after.roles.cache.size) {
            functions.stickyRoles.loadSpecific(before.guild, after);
        };
    }
}