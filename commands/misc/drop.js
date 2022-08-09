const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'drop',
        description: "Fait un drop dans le salon actuel",
        permissions: ['manage_guild'],
        dm: false,
        private: false,
        aliases: [],
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: async(message, args) => {
        let drop = args.join(' ');
        if (!drop) return functions.reply(message, package.embeds.noText(message.author));

        const embed = package.embeds.classic(message.author)
            .setTitle("Drop")
            .setDescription(`${package.emojis.gsdrop} Drop de <@${message.author.id}> !\n\nSoyez le premier à appuyer sur le bouton pour gagner !\n__**Récompense :**__ ${drop}`)
            .setColor(message.guild.me.displayHexColor)
        
        const row = new Discord.MessageActionRow()
            .setComponents(
                new Discord.MessageButton()
                    .setCustomId('claim')
                    .setLabel('Réclamer')
                    .setEmoji(package.emojis.gsdrop)
                    .setStyle('SUCCESS')
        );

        message.delete().catch(() => {});
        const msg = await message.channel.send({ embeds: [ embed ], components: [ row ] }).catch(() => {});

        const collector = msg.createMessageComponentCollector({ filter: i => !i.user.bot, time: 120000, max: 1 });
        collector.on('end', (collected) => {
            if (collected.size == 0) {
                const ended = package.embeds.classic(message.author)
                    .setTitle("Drop terminé")
                    .setDescription(`Personne n'a réagit`)
                    .setColor('#ff0000')
                
                msg.edit({ embeds: [ended], components: [] }).catch(() => {});
            } else {
                collected.first().deferUpdate()

                const ended = package.embeds.classic(message.author)
                    .setTitle("Drop terminé")
                    .setDescription(`<@${collected.first().user.id}> a gagné ${drop}`)
                    .setColor(collected.first().member.roles.highest.hexColor)
                
                msg.edit({ embeds: [ended], components: [] }).catch(() => {});
            };
        });
    }
}