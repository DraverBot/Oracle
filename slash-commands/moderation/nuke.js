const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        systems: [],
        dev: false,
        dm: false,
        permissions: ['manage_channels']
    },
    configs: {
        name: 'nuke',
        description: "Nuke un salon",
        options: [
            {
                name: "salon",
                description: "Salon à nuker",
                type: 'CHANNEL',
                required: true
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let channel = interaction.options.getChannel('salon');
        if (channel.id == interaction.channel.id) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Salon invalide")
            .setDescription(`Je ne peux pas nuker ce salon, car c'est celui dans lequel la commande a été effectuée.`)
            .setColor('#ff0000')
        ] }).catch(() => {});

        if (!['GUILD_NEWS', 'GUILD_TEXT'].includes(channel.type)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Salon invalide")
            .setDescription(`Je ne peux nuker que des salons textuels`)
            .setColor('#ff0000')
        ] }).catch(() => {});

        await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Nuke")
            .setDescription(`Le salon <#${channel.id}> sera nuké <t:${((Date.now() + 5000) / 1000).toFixed(0)}:R>`)
            .setColor('YELLOW')
        ], components: [ new Discord.MessageActionRow({ components: [ new Discord.MessageButton({ label: 'Annuler', style: 'DANGER', customId: 'cancel' }) ] }) ] }).catch(() => {});
        const msg = await interaction.fetchReply();
        const collector = msg.createMessageComponentCollector({ fliter: x => x.user.id == interaction.user.id, max: 1, time: 5000 });

        collector.on('end', async(collected) => {
            if (collected.size == 1) return interaction.editReply({ embeds: [ package.embeds.cancel() ], components: [] }).catch(() => {});
            await interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Nuke")
                .setDescription(`Le salon <#${channel.id}> est en cours de nettoyage ${package.emojis.loading}`)
                .setColor('YELLOW')
            ], components: [] }).catch(() => {});

            const propreties = {
                name: channel.name,
                topic: channel.topic,
                nsfw: channel.nsfw,
                permissionOverwrites: channel.permissionOverwrites.cache,
                type: channel.type,
                rawPosition: channel.rawPosition,
                position: channel.position,
                calculatedPosition: channel.calculatedPosition
            };
            if(channel.parent) propreties.parent = channel.parent;

            await channel.delete().catch(() => {});
            const channelN = await (interaction.guild.channels.create(channel.name, propreties).catch(() => {}));
            channelN.setPosition(propreties.position);

            if (!channelN) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Erreur")
                .setDescription(`Une erreur a eu lieu lors du nuke du salon`)
                .setColor('#ff0000')
            ], components: [] }).catch(() => {});
            interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Salon nuké")
                .setDescription(`Le salon <#${channelN.id}> a été nuké`)
                .setColor("#00ff00")
            ], components: [] }).catch(() => {});

            channelN.send({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Nuke")
                .setDescription(`Le salon a bien été réinitialisé !`)
                .setColor(interaction.guild.me.displayHexColor)
            ], components: [] }).catch(() => {});
            functions.log(interaction.guild, package.embeds.classic(interaction.user)
                .setTitle("Nuke")
                .setDescription(`Un [salon](https://discord.com/channels/${interaction.guild.id}/${channelN.id}) a été nuké`)
                .addFields(
                    {
                        name: "Modérateur",
                        value: `<@${interaction.user.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`,
                        inline: true
                    },
                    {
                        name: "Salon",
                        value: `<#${channelN.id}> ( ${channel.name} \`${channel.id}\` )`,
                        inline: true
                    }
                )
                .setColor('#ff0000')
            )
        })
    }
}