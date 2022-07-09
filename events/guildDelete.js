const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'guildDelete',
    /**
     * @param {Discord.Guild} guild 
     */
    execute: (guild) => {
        guild.client.fetchWebhook(package.configs.remove.id, package.configs.remove.token).then(web => {
            if (!web) return;

            web.send({ content: `J'ai été retiré de ${guild.name} ( ${guild.memberCount} membres ) ! Je suis maintenant sur \`${guild.client.guilds.cache.size}\` serveurs` }).catch(() => {});
        });
        guild.client.fetchWebhook(package.configs.statsYeikzy.id, package.configs.statsYeikzy.token).then(web => {
            if (!web) return;

            web.send({ content: `J'ai été retiré de ${guild.name} ( ${guild.memberCount} membres ) ! Je suis maintenant sur \`${guild.client.guilds.cache.size}\` serveurs` }).catch(() => {});
        });
    }
}