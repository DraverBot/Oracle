const { CommandInteraction } = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        permissions: ['BAN_MEMBERS']
    },
    configs: {
        name: 'softban',
        description: "Banni, puis débanni un membre du serveur",
        options: [
            {
                name: "membre",
                description: "Membre à softbannir",
                type: 'USER',
                required: true
            },
            {
                name: 'raison',
                description: "Raison du softban",
                type: 'STRING',
                required: true
            }
        ]
    },
    /**
     * @param {CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let member = interaction.options.getMember('membre');
        let raison = interaction.options.getString('raison').replace(/"/g, '\\"');

        if (!functions.checkPerms({ interaction, member, mod: interaction.member, checkBotCompare: true, checkOwner: true, checkSelfUser: true })) return;

        await member.ban({ reason: raison }).catch(() => {});
        await interaction.guild.members.unban(member.user, raison);

        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Softban")
            .setDescription(`${member.user.tag} a été softbanni.`)
            .setColor('#ff0000')
        ] }).catch(() => {});

        functions.addCase(interaction.guild.id, member.id, interaction.user.id, raison, 'softban');
        functions.log(interaction.guild, package.embeds.classic(interaction.user)
            .setTitle("Softban")
            .setDescription(`Un membre a été soft-banni`)
            .setColor('#ff0000')
            .addFields(
                {
                    name: "Modérateur",
                    value: `<@${interaction.user.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`,
                    inline: true
                },
                {
                    name: "Membre",
                    value: `<@${member.id}> ( ${member.user.tag} \`${member.id}\` )`,
                    inline: true
                },
                {
                    name: "Raison",
                    value: raison.replace(/\\"/g, '"'),
                    inline: true
                },
                {
                    name: 'Date',
                    value: `<t:${(Date.now() / 1000).toFixed(0)}:F> ( <t:${(Date.now() / 1000).toFixed(0)}:R> )`,
                    inline: false
                }
            )
        )
    }
}