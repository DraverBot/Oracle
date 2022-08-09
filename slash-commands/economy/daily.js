const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        sCd: { code: 'daily-reward', time: 60*60*24 },
        permissions: [],
        dm: false,
        dev: false,
        systems: [{ name: "d'économie", value: "economy_enable", state: true }]
    },
    configs: {
        name: 'daily',
        description: "Récupère votre récompense quotidienne"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let reward = functions.random(1000, 100);

        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Récompense quotidienne")
            .setDescription(`Vous récupérez **${reward}** ${package.configs.coins} grâce à votre récompense quotidienne`)
            .setColor(interaction.guild.me.displayHexColor)
        ] }).catch(() => {});

        interaction.client.CoinsManager.addCoins({ user_id: interaction.user.id, guild_id: interaction.guild.id }, reward);
    }
};