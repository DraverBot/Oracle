const Discord = require('discord.js');
const { gsyes, gsno } = require('../../assets/data/emojis.json');
const { classic, errorSQL } = require('../../assets/embeds.js');
const functions = require('../../assets/functions');

module.exports = {
    configs: {
        name: 'suggestion',
        description: "Fait une suggestion dans le salon de la commande",
        options: [
            {
                name: 'suggestion',
                description: "Suggestion à proposer",
                type: 'STRING',
                required: true
            }
        ]
    },
    help: {
        dm: false,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const suggest = classic(interaction.user)
        .setTitle("Suggestion")
        .setDescription(`Nouvelle **suggestion** de <@${interaction.user.id}> :\n> ${interaction.options.getString('suggestion')}`)
        .setColor(interaction.guild.me.displayHexColor);

        interaction.client.db.query(`SELECT suggest_channel FROM configs WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, 'query fetch at /suggestion', interaction.user);
                return interaction.reply({ embeds: [ errorSQL(interaction.user) ] }).catch(() => {});
            };
            const channel = interaction.guild.channels.cache.get(req[0]?.suggest_channel);
            if (!channel) return interaction.reply({ embeds: [ classic(interaction.user)
                .setTitle("Non configuré")
                .setDescription(`Le salon de suggestions n'est pas configuré.\nUtilisez la commande \`/config configurer\``)
                .setColor('#ff0000')
            ] }).catch(() => {});

            channel.send({ embeds: [ suggest ] }).then((x) => {
                interaction.reply({ embeds: [ classic(interaction.user)
                    .setTitle("Suggestion envoyée")
                    .setDescription(`J'ai envoyé votre suggestion ( <#${channel.id}> )`)
                    .setColor('#00ff00')
                ] }).catch(() => {});
                if (x) [ gsyes, gsno ].forEach(async(y) => await x.react(y));
            }).catch(() => {});
        })
    }
};