const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dm: false,
        dev: false
    },
    configs: {
        name: 'channelinfo',
        description: "Affiche les informations d'un salon",
        options: [
            {
                name: 'salon',
                description: "Salon dont vous voulez soutirer des informations",
                required: false,
                type: 'CHANNEL'
            }
        ]
    },
    /**
     * 
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let channel = interaction.options.get('salon')?.channel ?? interaction.channel;

        let fields = [
            {
                name: "Nom du salon",
                value: channel.name,
                inline: true
            },
            {
                name: "Identifiant",
                value: `\`${channel.id}\``,
                inline: true
            },
            {
                name: 'Sujet',
                value: channel.topic ?? 'Pas de sujet',
                inline: false
            },
            {
                name: "Type",
                value: channel.type == 'GUILD_NEWS' ? "Annonces" : channel.type == 'GUILD_CATEGORY' ? 'catégorie' : channel.type == 'GUILD_NEWS_THREAD' ? 'Fil de salon des annonces' : channel.type == 'GUILD_PRIVATE_THREAD' ? 'Fil privé' : channel.type == 'GUILD_PUBLIC_THREAD' ? "Fil" : channel.type == 'GUILD_STAGE_VOICE' ? "Salon de conférence" : channel.type == 'GUILD_TEXT' ? "Salon textuel" : channel.type == 'GUILD_VOICE' ? 'Salon vocal' : "Inconnu",
                inline: true
            }
        ];
        if (channel.parent) {
            fields.push({
                name: "Catégorie",
                value: `${channel.parent.name} ( \`${channel.parentId}\` )`,
                inline: true
            });
        };
        fields.push(
            {
                name: "Création",
                value: `<t:${(channel.createdTimestamp / 1000).toFixed(0)}:F> ( <t:${(channel.createdTimestamp / 1000).toFixed(0)}:R> )`,
                inline: false
            }
        );

        const embed = package.embeds.classic(interaction.user)
            .setTitle(channel.name)
            .setThumbnail('attachment://hashtag.png')
            .setFields(fields)
            .setColor(interaction.guild.me.displayHexColor)
        interaction.reply({ embeds: [ embed ], files: [ './assets/images/hashtag.png' ] })
    }
}