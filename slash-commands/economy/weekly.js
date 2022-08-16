const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        sCd: { code: 'weekly-reward', time: 60*60*24*7 },
        permissions: [],
        dm: false,
        dev: false,
        systems: [{ name: "d'économie", value: "economy_enable", state: true }]
    },
    configs: {
        name: 'weekly',
        description: "Récupère votre récompense hebdomadaire"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let reward = functions.random(8000, 800);

        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Récompense quotidienne")
            .setDescription(`Vous récupérez **${reward.toLocaleString('fr-DE')}** ${package.configs.coins} grâce à votre récompense hebdomadaire.`)
            .setColor(interaction.guild.me.displayHexColor)
        ] }).catch(() => {});

        interaction.client.CoinsManager.addCoins({ user_id: interaction.user.id, guild_id: interaction.guild.id }, reward);
    }
};