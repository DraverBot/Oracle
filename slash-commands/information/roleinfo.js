const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions: [],
        systems: [],
        dev: false,
        dm: false
    },
    configs: {
        name: 'roleinfo',
        description: "Affiche les informations d'un rôle",
        options: [
            {
                name: "rôle",
                description: "Rôle dont vous voulez vous informez",
                required: false,
                type: 'ROLE'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let role = interaction.options.get('rôle')?.role ?? interaction.member.roles.highest;
        await interaction.deferReply();
        await interaction.guild.members.fetch();
        await interaction.guild.roles.fetch();

        let up = interaction.guild.roles.cache.find(x => x.position == role.position + 1);
        let down = interaction.guild.roles.cache.find(x => x.position == role.position - 1);

        const embed = package.embeds.classic(interaction.user)
            .setTitle(role.name)
            .setColor(role.hexColor)
            .addFields(
                {
                    name: 'Identifiant',
                    value: role.id,
                    inline: true
                },
                {
                    name: "Couleur",
                    value: (role.hexColor.startsWith('#') ? '':"#") + role.hexColor,
                    inline: true
                },
                {
                    name: "Création",
                    value: `<t:${(role.createdTimestamp / 1000).toFixed(0)}:F> ( <t:${(role.createdTimestamp / 1000).toFixed(0)}:R> )`,
                    inline: true
                },
                {name: '\u200b', value: "\u200b", inline: false},
                {
                    name: 'Séparé des autres membres',
                    value: role.hoist ? '✅':'❌',
                    inline: true
                },
                {
                    name: 'Mentionnable',
                    value: role.mentionable ? '✅':'❌',
                    inline: true
                },
                {
                    name: "Membres avec ce rôle",
                    value: `${role.members.size} membre${role.members.size > 1 ? 's':''} (soit ~${((role.members.size * 100) / interaction.guild.members.cache.size).toFixed(0)}% du serveur)`,
                    inline: true
                },
                {
                    name: "Position",
                    value: (up ? `<@&${up.id}> >` : '') + `<@&${role.id}>` + (down ? down.id == interaction.guild.id ? `> @everyone`:`> <@&${down.id}>`:''),
                    inline: false
                }
            );
        
        interaction.editReply({ embeds: [ embed ] }).catch(() => {});
    }
}