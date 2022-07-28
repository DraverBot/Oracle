const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const commands = require('../../assets/data/commands.json');

module.exports.help = {
    name: "commande",
    aliases: ['cmd', 'commande-help'],
    description: "Affiche l'aide concernant une commande",
    permissions: [],
    private: false,
    dm: true,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    const commandName = args.shift();

    let command;
    Object.keys(commands).forEach((categorie) => {
        const test = commands[categorie].find((x) => x.help.name === commandName || (x.help.aliases && x.help.aliases.includes(commandName)));
        
        if (test) command = test;
    });

    if (!command || command.help.private || (command.help.appear !== undefined && command.help.appear === false)) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Commande inconnue")
        .setDescription(`Oops, il semblerait que cette commande soit inconnue.`)
        .setColor('#ff0000')
    ] });

    const perms = package.perms;

    const doc = `https://github.com/Greensky-gs/gs-bot-doc/blob/main/commands/${command.help.name}.md`;

    const embed = package.embeds.classic(message.author)
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
                name: 'Documentation',
                value: `[\`${command.help.name}\`](${doc})`,
                inline: true
            }
        )
        .setColor('ORANGE')
        .setURL(doc)

    functions.reply(message, embed);
}