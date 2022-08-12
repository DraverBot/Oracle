const Discord = require('discord.js');
const functions =  require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'kick',
        description: "Expulse un membre du serveur",
        options: [
            {
                name: 'utilisateur',
                description: "La personne à expulser du serveur",
                type: 'USER',
                required: true,
                autocomplete: false
            },
            {
                name: 'raison',
                description: "Raison de l'expulsion",
                type: 'STRING',
                required: true,
                autocomplete: false
            }
        ]
    },
    help: {
        dm: false,
        dev: false,
        permissions: ['kick_members'],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const member = interaction.options.get('utilisateur').member;
        const reason = interaction.options.get('raison').value;

        if (reason.includes('"')) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
        if (!functions.checkAllConditions(interaction.guild, interaction, interaction.member, member, interaction)) return;

        const kicked = package.embeds.classic(interaction.user)
            .setTitle("Expulsion")
            .setColor('#ff0000')
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setAuthor({ name: interaction.guild.name })
            .addFields(
                {
                    name: 'Modérateur',
                    value: `<@${interaction.user.id}> ( ${interaction.user.tag} ${interaction.user.id} )`,
                    inline: true
                },
                {
                    name: 'Membre',
                    value: `<@${member.id}> ( ${member.user.tag} ${member.id} )`,
                    inline: true
                },
                {
                    name: 'Raison',
                    value: reason,
                    inline: true
                }
            )

        interaction.reply({ embeds: [ kicked ] });
        member.send({ embeds: [ kicked ] }).catch(() => {});

        member.kick(reason).catch(() => {});

        functions.log(interaction.guild, kicked);
        functions.addCase(interaction.guild, member.id, interaction.user.id, reason, 'kick');
    }
}