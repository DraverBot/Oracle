const { MessageEmbed } = require('discord.js');

module.exports = {
    /**
     * @param {{ reward: String, winnerCount: Number, hosterId: String, channel: TextChannel, time: Number, ?bonusRoles: String[], ?deniedRoles: String[], ?requiredRoles: String[] }} data 
     */
    giveaway: (data) => {
        const embed = new MessageEmbed()
            .setTitle("🎉 Giveaway 🎉")
            .setColor('#00ff00')
            .setDescription(`**${data.reward}**
Offert par <@${data.hosterId}>
**${data.winnerCount}** gagnant${data.winnerCount > 1 ? 's':''}
Participants : ${data.participants ? data.participants.length : "0"}

Finit <t:${((parseInt(data.time) + Date.now()) / 1000).toFixed(0)}:R>`)
        
        if (data.bonusRoles && data.bonusRoles.length > 0) {
            embed.addFields({
                name: "Rôles bonus",
                value: data.bonusRoles.map((rId) => `<@&${rId}>`).join(' '),
                inline: false
            });
        };
        if (data.requiredRoles && data.requiredRoles.length > 0) {
            embed.addFields({
                name: "Rôles requis",
                value: data.requiredRoles.map((rId) => `<@&${rId}>`).join(' '),
                inline: false
            });
        };
        if (data.deniedRoles && data.deniedRoles.length > 0) {
            embed.addFields({
                name: "Rôles interdits",
                value: data.deniedRoles.map((rId) => `<@&${rId}>`).join(' '),
                inline: false
            });
        };

        return embed;
    },
    ended: (data, winners) => {
        const embed = new MessageEmbed()
            .setTitle("🎉 Giveaway terminé 🎉")
            .setColor('#ff0000')
            .setDescription(`**${data.reward}**
Offert par <@${data.hoster_id}>
${winners.length > 0 ? `Gagnant${data.winnerCount > 1 ? 's': ''} : ${winners.map(x => `<@${x}>`).join(' ')}`: "Pas de gagnants"}
Participants : ${data.participants.length}

Finit <t:${(Date.now() / 1000).toFixed(0)}:R>`)

        return embed;
    },
    hasDeniedRoles: (deniedRoles, url) => {
        let roles = deniedRoles;
        if (typeof roles == 'string') roles = JSON.parse(roles);

        return new MessageEmbed()
            .setTitle("🚫 Accès refusé")
            .setDescription(`L'accès à [**ce giveaway**](${url}) vous est refusé car vous avez un ou plusieurs de ces rôles :\n${roles.map(x => `<@&${x}>`).join(' ')}`)
            .setColor('#ff0000')
    },
    missingRequiredRoles: (requiredRoles, url) => {
        let roles = requiredRoles;
        if (typeof roles == 'string') roles = JSON.parse(roles);

        return new MessageEmbed()
            .setTitle("🚫 Accès refusé")
            .setDescription(`L'accès à [**ce giveaway**](${url}) vous est réfusé car vous n'avez pas un ou plusieurs de ces rôles :\n${roles.map(x => `<@&${x}>`).join(' ')}`)
            .setColor('#ff0000')
    },
    entryAllowed: (url) => {
        return new MessageEmbed()
            .setTitle("🎉 Accès autorisé")
            .setColor('#00ff00')
            .setDescription(`Votre participation à [**ce giveaway**](${url}) a été confirmée.\nBonne chance !`)
    },
    alreadyParticipate: (url) => {
        return new MessageEmbed()
            .setTitle("🚫 Déjà participé")
            .setDescription(`Vous participez déjà à [**ce giveaway**](${url}).`)
            .setColor('#ff0000')
    },
    notParticipated: (url) => {
        return new MessageEmbed()
            .setTitle("🚫 Pas de participation")
            .setDescription(`Vous n'avez pas participé à [**ce giveaway**](${url})`)
            .setColor('#ff0000')
    },
    removeParticipation: (url) => {
        return new MessageEmbed()
            .setTitle("❌ Participation annulée")
            .setDescription(`Votre participation à [**ce giveaway**](${url}) a été annulée.`)
            .setColor('#00ff00')
    },
    winners: (winners, url) => {
        if (winners.length == 0) return new MessageEmbed()
            .setTitle("Pas de gagnants")
            .setDescription(`Il n'y a aucun gagnants pour [**ce giveaway**](${url}).`)
            .setColor('#ff0000');
        
        return new MessageEmbed()
            .setTitle("🎉 Gagnants")
            .setDescription(`Le${winners.length > 1 ? 's':''} gagnant${winners.length > 1 ? 's':''} de [**ce giveaway**](${url}) ${winners.length > 1 ? 'sont':'est'} ${winners.map(x => `<@${x}>`).join(' ')}`)
            .setColor('#00ff00')
    }
};