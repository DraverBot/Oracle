const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const modules = require('../../assets/data/modules.json');

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        permissions: ['manage_guild'],
        systems: []
    },
    configs: {
        name: 'modules',
        description: "Gère les modules",
        options: [
            {
                name: 'configurer',
                description: "Configure un module",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "module",
                        description: "Module à configurer",
                        type: 'STRING',
                        required: true,
                        choices: modules.map(x => ({ name: x.name, value:x.value }))
                    },
                    {
                        name: "état",
                        description: "État du module",
                        type: 'BOOLEAN',
                        required: true
                    }
                ]
            },
            {
                name: "afficher",
                description: "Affiche l'état des modules sur le serveur",
                type: 'SUB_COMMAND'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand == 'configurer') {
            let moduleSelectioned = interaction.options.getString('module');
            let state = interaction.options.getBoolean('état');

            interaction.client.ModulesManager.setModule({ module: moduleSelectioned, state, guildId: interaction.guild.id });
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Module configuré")
                .setDescription(`Le module **${modules.find(x => x.value == moduleSelectioned).name}** est désormais **${state == true ? 'activé':'désactivé'}**`)
                .setColor('#00ff00')
            ] }).catch(() => {});

            functions.log(interaction.guild, package.embeds.classic(interaction.user)
                .setTitle("Module configuré")
                .setDescription(`Un module a été configuré`)
                .setColor('#00ff00')
                .addFields(
                    {
                        name: "Modérateur",
                        value: `<@${interaction.user.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`,
                        inline: true
                    },
                    {
                        name: "Module",
                        value: modules.find(x => x.value == moduleSelectioned).name,
                        inline: true
                    },
                    {
                        name: "État",
                        value: state == true ? 'activé':'désactivé',
                        inline: true
                    }
                )
            );
        };
        if (subcommand == 'afficher') {
            let data = modules.map(x => ({ name: x.name, value: interaction.client.ModulesManager.checkModule({ module: x.value, guildId: interaction.guild.id }) == false ? '✅ activé':'❌ désactivé', inline: false }));

            const embed = package.embeds.classic(interaction.user)
                .setTitle("Modules")
                .setDescription(`Voici l'état des **${data.length} modules** du serveur`)
                .addFields(data)
                .setColor(interaction.guild.me.displayHexColor)
            
            interaction.reply({ embeds: [ embed ] }).catch(() => {});
        }
    }
}