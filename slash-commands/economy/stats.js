const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        dm: false,
        dev: false,
        cd: 5,
        permissions: [],
        systems: [],
    },
    configs: {
        name: 'stats',
        description: "Affiche les statistiques économiques d'un utilisateur",
        options: [
            {
                name: 'utilisateur',
                description: "Utilisateur dont vous voulez voir les statistiques",
                required: false,
                type: 'USER'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let user = interaction.options.get('utilisateur')?.user ?? interaction.user;

        const stats = interaction.client.CoinsManager.getStats(`${interaction.guild.id}.${user.id}`) || { coins: 0, bank: 0 };
        const embed = package.embeds.classic(user)
            .setTitle("Stats")
            .addFields(
                {
                    name: 'En poche',
                    value: parseInt(stats.coins).toLocaleString('fr-DE') + ' ' + package.configs.coins,
                    inline: true
                },
                {
                    name: 'Banque',
                    value: parseInt(stats.bank).toLocaleString('fr-DE') + ' ' + package.configs.coins,
                    inline: true
                },
                {
                    name: 'Total',
                    value: (parseInt(stats.coins) + parseInt(stats.bank)).toLocaleString('fr-DE') + ' ' + package.configs.coins
                }
            )
            .setColor(interaction.guild.me.displayHexColor);
        
        interaction.reply({ embeds: [ embed ] }).catch(() => {});
    }
}