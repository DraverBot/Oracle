const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'guildCreate',
    /**
     * @param {Discord.Guild} guild 
     */
    execute: (guild) => {
        guild.client.fetchWebhook(package.configs.add.id, package.configs.add.token).then(web => {
            if (!web) return;

            web.send({ content: `J'ai été ajouté sur ${guild.name} ( ${guild.memberCount.toLocaleString('fr')} membres ) ! Je suis maintenant sur \`${guild.client.guilds.cache.size}\`` }).catch(() => {});
        });
    }
}