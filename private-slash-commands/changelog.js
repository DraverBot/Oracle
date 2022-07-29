const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    guild: '945710914873745419',
    configs: {
        name: 'changelog',
        description: "Envoie le changelog",
        options: [
            {
                name: 'nom',
                description: "Nom de l'update",
                type: 'STRING',
                required: true
            },
            {
                name: 'ajouts',
                description: "Les ajouts de la mise à jour (séparés par --)",
                type: 'STRING',
                required: false
            },
            {
                name: 'retraits',
                description: "Les retraits de la mise à jour (séparés par --)",
                type: 'STRING',
                required: false
            },
            {
                name: 'fix',
                description: "Les fix de la mise à jour (séparés par --)",
                type: 'STRING',
                required: false
            },
            {
                name: 'note',
                description: "Remarque",
                type: 'STRING',
                required: false
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (![package.configs.gs, package.configs.yz].includes(interaction.user.id)) return interaction.reply({ content: "Cette commande est réservée aux développeurs", ephemeral: true });

        let adds = interaction.options.getString('ajouts');
        if (adds) {
            adds = adds.split('--').map(x => `→ ${x}`).join('\n');
        };
        let removes = interaction.options.getString('retraits');
        removes+='--*removed herobrine*';

        if (removes) {
            removes = removes.split('--').map(x => `→ ${x}`).join('\n');
        };
        let fixes = interaction.options.getString('fix');
        if (fixes) {
            fixes = fixes.split('--').map(x => `→ ${x}`).join('\n');
        };

        let note = interaction.options.getString('note');
        let name = interaction.options.getString('nom');

        let changelog = package.embeds.classic(interaction.user)
            .setTitle("Changelog")
            .setURL(package.configs.link)
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setDescription(`__Version **${package.configs.version}**__\n*${name}${name.endsWith('update') ? ' update':''}*${note ? `\n\n${note}`:''}${adds ? `\n\n**Ajouts :**\n${adds}` :''}${fixes ? `\n\n**Fix :**\n${fixes}`:''}${removes ? `\n\n**Retraits :**\n${removes}`:''}`)
            .setColor('ORANGE')
            .addField('Documentation', `[Documentation](${package.configs.doc})`, false)

        let channel = interaction.guild.channels.cache.get('964810537865216020');
        channel.send({ embeds: [ changelog ] }).catch(() => {});

        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Changelog envoyé")
            .setDescription(`Changelog envoyé dans <#964810537865216020>`)
            .setColor('ORANGE')
        , changelog], ephemeral: true }).catch(() => {});
    }
}