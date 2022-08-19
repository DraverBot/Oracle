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
        name: 'userinfo',
        description: "Affiche les informations d'un utilisateur",
        options: [
            {
                name: 'utilisateur',
                description: "Utilisateur dont vous voulez être informé",
                type: 'USER',
                required: false
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run:(interaction) => {
        let member = interaction.options.getMember('utilisateur') ?? interaction.member;
        let user = interaction.options.getUser('utilisateur') ?? interaction.user;
        let roles = member.roles.cache.filter(x => x.id !== interaction.guild.id);
        
        const embed = package.embeds.classic(user)
            .setTitle(user.tag)
            .setDescription(`<@${user.id}>`)
            .setThumbnail(user.displayAvatarURL({ dynamic: false, format: 'png' }))
            .addFields(
                {
                    name: 'Identifiant',
                    value: `\`${user.id}\``,
                    inline: true
                },
                {
                    name: 'Pseudo',
                    value: member?.nick ?? 'Pas de pseudo',
                    inline: true
                },
                {
                    name: 'Création du compte',
                    value: `<t:${(user.createdTimestamp / 1000).toFixed(0)}:F> ( <t:${(user.createdTimestamp / 1000).toFixed(0)}:R> )`,
                    inline: false
                },
                {
                    name: 'Date d\'arrivée',
                    value: `<t:${(member.joinedTimestamp / 1000).toFixed(0)}:F> ( <t:${(member.joinedTimestamp / 1000).toFixed(0)}:R> )`,
                    inline: false
                },
                {
                    name: `Rôle${roles.length > 0 ? 's':''}`,
                    value: roles.map(x => `<@&${x.id}>`).join(' '),
                    inline: false
                },
                {
                    name: `Permission${member.permissions.has('ADMINISTRATOR') ? '' : member.permissions.length > 0 ? 's':''}`,
                    value: member.permissions.has('ADMINISTRATOR') ? 'Administrateur' : member.permissions.map(x => package.perms[x]).join(', '),
                    inline: false
                }
            )
            .setColor(member.displayHexColor)
        
        interaction.reply({ embeds: [ embed ] }).catch(() => {});
    }
};