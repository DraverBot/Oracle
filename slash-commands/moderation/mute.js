const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

const minutes = (n) => n * 1000 * 60;

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        systems: [],
        permissions: ['manage_guild']
    },
    configs: {
        name: 'mute',
        description: "Mute un membre du serveur",
        options: [
            {
                name: "membre",
                type: 'USER',
                description: "Membre à muter",
                required: true
            },
            {
                name: 'raison',
                type: 'STRING',
                description: "Raison du mute",
                required: true
            },
            {
                name: 'durée',
                type: 'INTEGER',
                description: "Durée du mute",
                required: false,
                choices: [
                    {
                        name: "5 minutes",
                        value: minutes(5)
                    },
                    {
                        name: '10 minutes',
                        value: minutes(10)
                    },
                    {
                        name: '20 minutes',
                        value: minutes(20)
                    },
                    {
                        name: '30 minutes',
                        value: minutes(30)
                    },
                    {
                        name: '45 minutes',
                        value: minutes(45)
                    },
                    {
                        name: '1 heure',
                        value: minutes(60)
                    },
                    {
                        name: '2 heures',
                        value: minutes(120)
                    },
                    {
                        name: '6 heures',
                        value: minutes(120*3)
                    },
                    {
                        name: '1 jour',
                        value: minutes(60*24)
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let member = interaction.options.getMember('membre');
        let reason = interaction.options.getString('raison');
        let time = parseInt(interaction.options.get('durée').value);

        if (!functions.checkPerms({ interaction, member, mod: interaction.member, all: true })) return;
        if (reason.includes('"')) return interaction.reply({ embeds: [ package.embeds.guillement(interaction.user) ] }).catch(() => {});

        interaction.member.timeout(time, reason);
        const embed = package.embeds.classic(interaction.user)
            .setTitle("Mute")
            .setDescription(`<@${interaction.user.id}> a rendu <@${member.id}> muet.`)
            .addFields(
                {
                    name: "Modérateur",
                    value: `<@${interaction.user.id}> ( \`${interaction.user.id}\` ${interaction.user.tag} )`,
                    inline: true
                },
                {
                    name: "Membre",
                    value: `<@${member.id}> ( \`${member.id}\` ${member.user.tag} )`,
                    inline: true
                },
                {
                    name: 'raison',
                    value: reason,
                    inline: true
                },
                {
                    name: "Durée",
                    value: `<@${member.id}> sera démuté <t:${time / 1000}:F>`,
                    inline: false
                }
            )
            .setColor('#ff0000')
        
        interaction.reply({ embeds: [ embed ] }).catch(() => {});
        functions.log(interaction.guild, embed);
        functions.addCase(interaction.guild.id, member.id, interaction.user.id, reason, 'mute');
    }
}