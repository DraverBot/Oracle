const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'guildBanAdd',
    /**
     * 
     * @param {Discord.GuildBan} ban 
     */
    execute: (ban) => {
        const guild = ban.guild;
        
        guild.fetchAuditLogs({
            type: "MEMBER_BAN_ADD",
        }).then((logs) => {
            const log = logs.entries.first();

            const embed = new Discord.EmbedBuilder()
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) ? guild.iconURL({ dynamic: true }) : log.target.displayAvatarURL({ dynamic: true }) })
                .setTitle("Bannissement")
                .setColor('#ff0000')
                .setThumbnail(log.target.displayAvatarURL({ dynamic: false }))
                .setDescription(`<@${log.target.id}> ( ${log.target.tag} ) a été banni par <@${log.executor.id}> pour la raison \`\`\`${log.reason ? log.reason : "Aucune raison"}\`\`\``)

            functions.log(guild, embed);
            functions.addCase(guild.id, log.target.id, log.executor.id, (log.reason || "pas de raison"), 'ban');
        })
    }
}