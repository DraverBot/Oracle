const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions: [],
        systems: [],
        dm: false,
        dev: false
    },
    configs: {
        name: 'leaderboard',
        description: "Affiche le classement des " + package.configs.coins + " du serveur"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let stats = interaction.client.CoinsManager.getGuild(interaction.guild.id);
        if (stats.length == 0) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Leaderboard")
            .setDescription(`Il n'y a personne classé dans le serveur`)
            .setColor('#ff0000')
        ] }).catch(() => {});

        stats = stats.map(x => ({ coins: (parseInt(x.coins.coins) + parseInt(x.coins.bank)), user: x.user })).sort((a, b) => b.coins - a.coins);

        if (stats.length > 5) {
            let now = package.embeds.classic(interaction.user)
                .setTitle("Classement")
                .setDescription(`Voici le classement des ${package.configs.coins} sur le serveur`)
                .setColor('ORANGE')
            
            let embeds = [];
            let pile = false;
            let count = 0;
            
            stats.forEach((stat, i) => {                
                now.addFields({
                    name: `${i + 1}]`,
                    value: `<@${stat.user}>\n${parseInt(stat.coins).toLocaleString('fr-DE')} ${package.configs.coins}`,
                    inline: false
                });

                pile = false;

                count++;
                if (count === 5) {
                    count=0;
                    pile = true;
                    embeds.push(now);

                    now = null;
                    now = package.embeds.classic(interaction.user)
                    .setTitle("Classement")
                    .setDescription(`Voici le classement des ${package.configs.coins} sur le serveur`)
                    .setColor('ORANGE')

                }
            });

            if (!pile) embeds.push(now);
            
            functions.pagination(interaction.user, 'none', embeds, `richarchie`, interaction);
        } else {
            const embed = package.embeds.classic(interaction.user)
            .setTitle("Classement")
            .setDescription(`Voici le classement des ${package.configs.coins} sur le serveur`)
            .setColor('ORANGE')

            stats.forEach((stat, i) => {
                const x = stat.coins.toLocaleString('fr-DE');
                embed.addFields({
                    name: `${i + 1}]`,
                    value: `<@${stat.user}>\n${x}`,
                    inline: false});
            });

            interaction.reply({ embeds: [ embed ] }).catch(() => {});
        }
    }
}