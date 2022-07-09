const Discord = require('discord.js');
const ms = require('ms');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'rappel',
        description: "Gère vos rappels",
        aliases: ['rmd', 'remind', 'reminders', 'rap'],
        permissions: [],
        dm: true,
        private: false,
        cooldown: 5
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     * @param {Discord.Client} client 
     */
    run: (message, args, client, prefix) => {
        const subcommand = (args.shift() || 'help').toLowerCase();

        if (subcommand === ('add' || 'a')) {
            const time = args[0];
            if (!ms(time)) return functions.lineReply(message.id, message.channel, package.embeds.invalidTime(message.author), true);

            const remind = args.slice(1).join(' ');
            if (!remind) return functions.lineReply(message.id, message.channel, package.embeds.classic(message.author)
                .setTitle("Pas de rappel")
                .setDescription(`${package.emojis.novalid} Vous n'avez pas précisé de rappel`)
                .setColor('#ff0000')
            , true);

            client.RemindsManager.create(message.author, message.channel, ms(time), remind);
        } else if (subcommand === ('remove' || 'r')) {
            const number = parseInt(args[0]);

            client.RemindsManager.remove(message.author, message.channel, number);
        } else if (subcommand === ('liste' || 'l')) {
            client.RemindsManager.list(message.author, message.channel);
        } else {
            const embed = package.embeds.classic(message.author)
                .setTitle("Rappels")
                .setDescription(`Commande: \`${prefix}rappel\`
> Permet de gérer vos rappels.
Sous-commandes: \`add\`, \`remove\`, \`liste\`

Exemples:
\`${prefix}rappel add 1h ajouter le bot\`
\`${prefix}rmd a 10m s'occuper des rôles\`
\`${prefix}rap remove 1\`
\`${prefix}remind liste\``)
                .setColor('ORANGE')

            functions.lineReply(message.id, message.channel, embed, true);
        }
    }
}