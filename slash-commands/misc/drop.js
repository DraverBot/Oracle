const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'drop',
        description: "Fait un drop dans le salon",
        options: [
            {
                name: 'récompense',
                description: "Récompense du drop",
                type: 'STRING',
                required: true
            }
        ]
    },
    help: {
        dm: false,
        dev: false,
        permissions: ['manage_guild'],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        const drop = interaction.options.getString('récompense');

        const embed = package.embeds.classic(interaction.user)
            .setTitle("Drop")
            .setDescription(`${package.emojis.gsdrop} Drop de <@${interaction.user.id}> !\n\nSoyez le premier à appuyer sur le bouton pour gagner !\n__**Récompense :**__ ${drop}`)
            .setColor(interaction.guild.me.displayHexColor)
        
        const row = new Discord.MessageActionRow()
            .setComponents(
                new Discord.MessageButton()
                    .setCustomId('claim')
                    .setLabel('Réclamer')
                    .setEmoji(package.emojis.gsdrop)
                    .setStyle('SUCCESS')
        );

        await interaction.reply({ embeds: [ embed ], components: [ row ] }).catch(() => {});
        const msg = await interaction.fetchReply();

        const collector = msg.createMessageComponentCollector({ filter: i => !i.user.bot, time: 120000, max: 1 });
        collector.on('end', (collected) => {
            if (collected.size == 0) {
                const ended = package.embeds.classic(interaction.user)
                    .setTitle("Drop terminé")
                    .setDescription(`Personne n'a réagit`)
                    .setColor('#ff0000')
                
                msg.edit({ embeds: [ended], components: [] }).catch(() => {});
            } else {
                collected.first().deferUpdate()

                const ended = package.embeds.classic(interaction.user)
                    .setTitle("Drop terminé")
                    .setDescription(`<@${collected.first().user.id}> a gagné ${drop}`)
                    .setColor(collected.first().member.roles.highest.hexColor)
                
                msg.edit({ embeds: [ended], components: [] }).catch(() => {});
            };
        });
    }
}