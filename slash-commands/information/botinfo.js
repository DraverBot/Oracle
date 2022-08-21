const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: true
    },
    configs: {
        name: 'botinfo',
        description: "Affiche quelques informations sur le bot"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        await interaction.client.guilds.fetch();

        const embed = package.embeds.classic(interaction.user)
            .setThumbnail(interaction.client.user.avatarURL())
            .setTitle("Bot informations")
            .setDescription(`Voici quelques informations me concernant`)
            .addFields(
                {
                    name: "Version",
                    value: package.configs.version,
                    inline: true
                },
                {
                    name: "Serveurs",
                    value: interaction.client.guilds.cache.size.toLocaleString('fr-DE'),
                    inline: true
                },
                {
                    name: "Utilisateurs",
                    value: interaction.client.guilds.cache.map(x =>x.memberCount).reduce((a, b) => a + b).toLocaleString('fr-DE'),
                    inline: true
                },
                {
                    name: "\u200b",
                    value: '\u200b',
                    inline: false
                },
                {
                    name: "Support",
                    value: `[invitation](${package.configs.support})`,
                    inline: true
                },
                {
                    name: "Ajouter Oracle",
                    value: `[lien](${package.configs.link})`,
                    inline: true
                },
                {
                    name: "Page top.gg",
                    value: `[Lien](${package.configs.topgg})`,
                    inline: true
                },
                {
                    name: "Développeur",
                    inline: false,
                    value: `[${((await interaction.client.users.fetch(package.configs.gs)).tag)}](https://github.com/Greensky-gs)`
                }
            )
            .setColor(interaction?.guild?.me?.displayHexColor ?? 'ORANGE')
        
        let row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setLabel('Code source')
                    .setStyle('LINK')
                    .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            );
        
        let components = [];
        if (functions.random(10, 0) == 4) components.push(row);
        interaction.reply({ embeds: [ embed ], components }).catch(() => {});
    }
}