const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        systems: [],
        permissions: []
    },
    configs: {
        name: 'classement',
        description: "Affiche le classement des niveaux du serveur"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        interaction.client.db.query(`SELECT * FROM levels WHERE guild_id="${interaction.guild.id}"`, (error, request) => {
            if (error) {
                functions.sendError(error, 'query at /classement', interaction.user)
                interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});

                return;
            };

            const levels = request.sort((a, b) => b.total - a.total);
            
            if (request.length < 5) {   
                const embed = package.embeds.classic(interaction.user)
                    .setTitle("Niveaux")
                    .setDescription(`Voici le top **${levels.length.toLocaleString('fr-DE')}** des niveaux du serveur.`)
                    .setColor('ORANGE')

                levels.forEach((lvl) => {
                    embed.addField(
                        (levels.indexOf(lvl) + 1).toString(),
                        `<@${lvl.user_id}>
> Niveau **${parseInt(lvl.level).toLocaleString('fr-DE')}**
> Avec un total de **${parseInt(lvl.total).toLocaleString('fr-DE')} messages**`,
                        false
                    );
                });

                interaction.reply({ embeds: [ embed ] }).catch(() => {});
            } else {
                let now = package.embeds.classic(interaction.user)
                    .setTitle("Niveaux")
                    .setDescription(`Voici le top **${levels.length.toLocaleString('fr-DE')}** des niveaux du serveur.`)
                    .setColor('ORANGE')

                var embeds = [];
                let pile = false;
                let count = 0;

                for (let i = 0; i < levels.length; i++) {
                    const lvl = levels[i];

                    now.addField(
                        (levels.indexOf(lvl) + 1).toString(),
                        `<@${lvl.user_id}>
> Niveau **${parseInt(lvl.level).toLocaleString('fr-DE')}**
> Avec un total de **${parseInt(lvl.total).toLocaleString('fr-DE')} messages**`,
                        false
                    );

                    pile = false;

                    count++;
                    if (count === 5) {
                        count=0;
                        pile = true;
                        embeds.push(now);

                        now = null;
                        now = package.embeds.classic(interaction.user)
                            .setTitle("Niveaux")
                            .setDescription(`Voici le top **${levels.length.toLocaleString('fr-DE')}** des niveaux du serveur.`)
                            .setColor('ORANGE')

                    }
                };

                if (!pile) embeds.push(now);
            
                functions.pagination(interaction.user, 'none', embeds, 'classement', interaction);
            }
        })
    }
}