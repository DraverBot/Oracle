const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'warn',
        description: "Avertit un utilisateur",
        options: [
            {
                name: 'utilisateur',
                description: "L'utilisateur en question",
                required: true,
                autocomplete: false,
                type: 'USER'
            },
            {
                name: "raison",
                description: "Raison de l'avertissement",
                required: true,
                autocomplete: false,
                type: "STRING"
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Cette commande n'est pas exécutable en messages privés." });
        if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, 'gérer le serveur') ] }).catch(() => {});

        const reason = interaction.options.get('raison').value;
        const member = interaction.options.get('utilisateur').member;

        if (!functions.checkAllConditions(interaction.guild, interaction.channel, interaction.member, member)) return interaction.deferReply();

        functions.addCase(interaction.guild.id, member.id, interaction.user.id, reason, 'warn');
        const warn = package.embeds.classic(interaction.user)
            .setTitle("Avertissement")
            .setColor('#ff0000')
            .addFields(
                {
                    name: "Modérateur",
                    value: `<@${interaction.user.id}> ( ${interaction.user.tag} ${interaction.user.id} )`,
                    inline: true
                },
                {
                    name: 'Membre',
                    value: `<@${member.id}> ( ${member.user.tag} ${member.user.id} )`,
                    inline: true
                },
                {
                    name: 'Raison',
                    value: reason,
                    inline: true
                }
            )
        
        interaction.reply({ embeds: [ warn ] });
        member.user.send({ embeds: [ warn ] }).catch(() => {});

        functions.log(interaction.guild, warn);
    }
}