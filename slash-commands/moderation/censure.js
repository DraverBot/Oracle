const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions: ['manage_nicknames'],
        systems: [],
        dm: false,
        dev: false
    },
    configs: {
        name: 'censure',
        description: "Censure le pseudo d'un membre",
        options: [
            {
                name: 'membre',
                description: "Membre à censurer",
                type: 'USER',
                required: true
            },
            {
                name: 'raison',
                description: "Raison de la censure",
                type: 'STRING',
                required: true
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let member = interaction.options.getMember('membre');
        let reason = interaction.options.getString('raison');
        if (!functions.checkAllConditions(interaction.guild, null, interaction.member, member, interaction)) return;

        const caracts = "0132456798#&@%*:/;,?!§^$*";
        let nickname = "";

        const max = member?.nick?.length ?? functions.random(16, 8);
        for (let i = 0; i<max;i++) {
            const caract = caracts[functions.random(caracts.length, 0)];
            nickname+=caract;
        };

        const embed = package.embeds.classic(message.author)
            .setTitle("Censure")
            .setColor('#ff0000')
            .addFields(
                {
                    name: "Modérateur",
                    value: `<@${message.author.id}> (${message.author.tag})`,
                    inline: true
                },
                {
                    name: "Membre",
                    value: `<@${member.id}> (${member.user.tag})`,
                    inline: true
                },
                {
                    name: 'Raison',
                    value: reason,
                    inline: true
                }
            )

        member.setNickname(nickname, reason).catch(() => {});
        
        interaction.reply({ embeds: [ embed ] }).catch(() => {});
        member.send({ embeds: [embed] }).catch(() => {});

        functions.log(interaction.guild, embed);
        functions.addCase(interaction.guild.id, member.id, interaction.user.id, reason, 'censure');
    }
}