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

            web.send({ content: `J'ai été ajouté sur ${guild.name} ( ${guild.memberCount.toLocaleString('fr')} membres ) ! Je suis maintenant sur \`${guild.client.guilds.cache.size}\` serveurs` }).catch(() => {});
        });
        guild.client.fetchWebhook(package.configs.statsYeikzy.id, package.configs.statsYeikzy.token).then((web) => {
            if (!web) return;

            web.send({ content: `J'ai été ajouté sur ${guild.name} ( ${guild.memberCount.toLocaleString('fr')} membres ) ! Je suis maintenant sur \`${guild.client.guilds.cache.size}\` serveurs` }).catch(() => {});
        });

        guild.client.db.query(`SELECT guild_id FROM configs WHERE guild_id="${guild.id}"`, (e, r) => {
            if (e) functions.sendError(e, 'guild create event query fetch', guild.client.user);

            if (r.length == 0) {
                guild.client.db.query(`INSERT INTO configs (guild_id) VALUES ("${guild.id}")`, (er) => {
                    if (er) functions.sendError(err, 'query insert at guildCreate', guild.client.user);
                });
            };
        });
    }
}