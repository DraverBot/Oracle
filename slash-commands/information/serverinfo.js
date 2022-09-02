const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        systems: [],
        permissions: [],
        dev: false,
        dm: false
    },
    configs: {
        name: 'serverinfo',
        description: "Affiche les informations du serveur"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        const guild = interaction.guild;
        await interaction.deferReply();
        await guild.members.fetch();
        await guild.roles.fetch();
        await guild.channels.fetch();
        await guild.emojis.fetch();

        const empty = {name: '\u200b', value: '\u200b', inline: false};

        const fields = [
            {
                name: "Propriétaire",
                value: `<@${guild.ownerId}> ( \`${guild.ownerId}\` )`,
                inline: true
            },
            {
                name: "Identifiant",
                value: guild.id,
                inline: true
            },empty,
            {
                name: "Membres",
                value: guild.memberCount.toString(),
                inline: true
            },
            {
                name: "Bots",
                value: guild.members.cache.filter(x => x.user.bot).size + '** **',
                inline: true
            },
            {
                name: "Humains",
                value: guild.members.cache.filter(x => !x.user.bot).size + '** **',
                inline: true
            },empty,
            {
                name: "Boosts",
                value: `${guild.premiumSubscriptionCount} boost${guild.premiumSubscriptionCount > 1 ? 's':''} (\`Niveau ${guild.premiumTier == 'NONE' ? 0 : guild.premiumTier == 'TIER_1' ? 1 : guild.premiumTier == 'TIER_2' ? 2 : 3}\`)`,
                inline: false
            },
            {
                name: "Rôles",
                value: `${guild.roles.cache.size}` + '** **',
                inline: true
            },
            {
                name: "Salons",
                value: `${guild.channels.cache.size}` + '** **',
                inline: true
            },
            {
                name: "Émojis",
                value: `${guild.emojis.cache.size}` + '** **',
                inline: true
            },
            empty,
            {
                name: "Création",
                value: `<t:${(guild.createdTimestamp / 1000).toFixed(0)}:F> ( <t:${(guild.createdTimestamp / 1000).toFixed(0)}:R> )`,
                inline: false
            }
        ];

        console.log(fields);
        const embed = package.embeds.classic(interaction.user)
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true }) ?? interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                fields
            )
            .setColor(guild.roles.highest.hexColor)

        interaction.editReply({ embeds: [ embed ] }).catch(() => {})
    }
}