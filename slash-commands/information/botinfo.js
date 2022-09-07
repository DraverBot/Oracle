const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions: [],
        dev: false,
        dm: false,
        systems: []
    },
    configs: {
        name: 'botinfo',
        description: "Affiche les informations me concernant"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        await interaction.deferReply();
        const { client } = interaction;

        await client.guilds.fetch();
        const gs = await client.users.fetch(package.configs.gs);
        const memberCount = client.guilds.cache.map(x => x.memberCount).reduce((a, b) => a + b);

        const embed = package.embeds.classic(interaction.user)
            .setThumbnail(client.user.avatarURL({ dynamic: false, format: 'png' }))
            .setColor('ORANGE')
            .setFields(
                {
                    name: 'Version',
                    value: package.configs.version,
                    inline: true
                },
                {
                    name: 'Serveurs',
                    value: client.guilds.cache.size.toLocaleString('fr-DE'),
                    inline: true
                },
                {
                    name: 'Membres',
                    value: memberCount.toLocaleString('fr-DE'),
                    inline: true
                },
                {
                    name: '\u200b',
                    value: '\u200b',
                    inline: false
                },
                {
                    name: 'Développeur',
                    value: `[${gs.tag}](https://github.com/Greensky-gs)`,
                    inline: true
                },
                {
                    name: 'Liens',
                    value: `[Invitation](${package.configs.link})\n[Page top.gg](https://top.gg/bot/991365898776625204)\n[Serveur de support](${package.configs.support})\n[Code source](https://www.youtube.com/watch?v=dQw4w9WgXcQ)`,
                    inline: true
                }
            )
            .setTitle(client.user.username)
        
        interaction.editReply({ embeds: [ embed ] }).catch(() => {});
    }
}