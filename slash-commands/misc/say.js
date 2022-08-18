const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'say',
        description: "Fait dire quelque chose à Oracle",
        options: [
            {
                name: 'texte',
                type: 'STRING',
                required: true,
                description: "Texte à faire répéter"
            }
        ]
    },
    help: {
        cd: 5,
        dev: false,
        permissions: ['manage_guild'],
        systems: [],
        dm: false
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let text = interaction.options.getString('texte');

        await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Répétition")
            .setDescription(`Je répète ce que vous avez dit`)
            .setColor('YELLOW')
        ], ephemeral: true }).catch(() => {});
        const msg = await (await interaction.channel.send({ content: text }).catch(() => {})).url
        await interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Répétition")
            .setDescription(`J'ai répété ce que vous m'avez demandé de répéter`)
            .setColor('#00ff00')
        ] }).catch(() => {});

        functions.log(interaction.guild, package.embeds.classic(interaction.user)
            .setTitle("Message répété")
            .setDescription(`Un [**message**](${msg}) a été répété dans <#${interaction.channel.id}>`)
            .addFields(
                {
                    name: "Modérateur",
                    value: `<@${interaction.user.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`,
                    inline: true
                },
                {
                    name: "Salon",
                    value: `<#${interaction.channel.id}> ( ${interaction.channel.name} \`${interaction.channel.id}\` )`,
                    inline: true
                },
                {
                    name: "Contenu",
                    value: text.length < 1024 ? text : `${text.substring(0, 1021)}...`,
                    inline: true
                }
            )
            .setColor('#ff0000')
        )
    }
}