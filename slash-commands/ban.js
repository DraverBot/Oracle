const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'ban',
        description: "Banni un membre pour une raison donnée",
        options: [
            {
                name: 'membre',
                required: true,
                description: "L'utilisateur que vous voulez bannir",
                autocomplete: false,
                type: 'USER'
            },
            {
                name: 'raison',
                required: true,
                description: "Raison du bannissement",
                autocomplete: false,
                type: 'STRING'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Cette commande n'est pas exécutable en messages privés." });
        if (!interaction.member.permissions.has('BAN_MEMBERS')) return interaction.reply({ content: "Vous n'avez pas les permissions nécéssaires", ephemeral: true });

        const member = interaction.options.get('member').member;
        const reason = interaction.options.get('raison').value;
        if (reason.includes('"')) return interaction.reply({ embeds: [ package.embeds.guillement(interaction.user) ] });

        if (!functions.checkAllConditions(interaction.guild, interaction.channel, interaction.member, member)) return interaction.deferReply();

        const emojis = package.emojis;
        const banned = package.embeds.classic(interaction.user)
            .setTitle("Bannissement")
            .setFooter({ text: interaction.member.nickname ? interaction.member.nickname : interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : interaction.user.displayAvatarURL({ dynamic: true }) })
            .setColor('#ff0000')
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
                    value: '```' + reason + '```',
                    inline: true
                }
            )
        interaction.reply({ embeds: [ banned ] });
        functions.log(interaction.guild, banned);
        functions.addCase(interaction.guild.id, member.id, interaction.user.id, reason, 'ban');

        member.send({ embeds: [ banned ] }).catch(() => {});
        member.ban({ reason: reason }).catch(() => {});
    }
}