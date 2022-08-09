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
        const commandList = require('../../assets/data/commands.json');

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
                    value: `${command.help.cooldown} seconde(s)`,
                    inline: true
                },
                {
                    name: "Alias",
                    value: command.help.aliases.length === 0 ? "Aucun alias" : command.help.aliases.map((alias) => `\`${alias}\``).join(', '),
                    inline: true
                },
                {
                    name: "Permissions",
                    value: command.help.permissions.length === 0 ? 'Aucune permission nécéssaires' : command.help.permissions.map((perm) => '`' + perms[perm.toUpperCase()] + '`').join(', '),
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
                },
                {
                    name: "Documentation",
                    value: `[${command.name}](https://github.com/BotOracle/Documentation/blob/main/commands/${command.name})`,
                    inline: true
                }
            )
        .setColor('ORANGE')

        interaction.reply({ embeds: [ embed ], ephemeral: ephemeral });
    }
}