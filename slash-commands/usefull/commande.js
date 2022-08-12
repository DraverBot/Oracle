const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'commande',
        description: "Affiche les informations concernant une commande",
        options: [
            {
                name: 'commande',
                description: "Nom de la commande",
                required: true,
                autocomplete: false,
                type: 'STRING'
            },
            {
                name: 'discret',
                description: "Fait en sorte que seul vous voit la réponse.",
                required: false,
                autocomplete: false,
                type: 'BOOLEAN'
            }
        ]
    },
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const ephemeral = interaction.options.get('discret') ? interaction.options.get('discret').value : true;

        const commandName = interaction.options.get('commande').value;
        const commandList = require('../../assets/data/slashCommands');

        let command;
        Object.keys(commandList).forEach((key) => {
            const test = commandList[key].find((x) => x.help.name === commandName.toLowerCase() || (x.help.aliases && x.help.aliases.includes(commandName.toLowerCase())));

            if (test) command = test;
        });

        if (!command || command.help.private || (command.help.appear !== undefined && command.help.appear === false)) return interaction.reply({ content: "Cette commande n'existe pas.", ephemeral: ephemeral });

        const perms = package.perms;
        
        const embed = package.embeds.classic(interaction.user)
            .setTitle(`Commande ${command.name}`)
            .setDescription(`**Description:** \`\`\`${command.help.description}\`\`\``)
            .addFields(
                {
                    name: "Cooldown",
                    value: `${command.help.cd} seconde(s)`,
                    inline: true
                },
                {
                    name: "Systèmes",
                    value: command.help.systems?.length === 0 ? "Aucun système requis" : command.help.systems.map((system) => `Système ${system.name} : doit être **${system.state == true ? 'activé':'désactivé'}**`).join(', '),
                    inline: true
                },
                {
                    name: "Permissions",
                    value: command.help.permissions?.length === 0 ? 'Aucune permission nécéssaires' : command.help.permissions.map((perm) => '`' + perms[perm.toUpperCase()] + '`').join(', '),
                    inline: true
                },
                {
                    name: '\u200b',
                    value: "\u200b",
                    inline: false
                },
                {
                    name: "Exécutable en privé ?",
                    value: command.help.dm ? "Oui" : "Non",
                    inline: true
                }
            )
        .setColor('ORANGE')

        interaction.reply({ embeds: [ embed ], ephemeral: ephemeral });
    }
}