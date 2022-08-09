const { Message, Client } = require('discord.js');
const { writeFileSync } = require('fs');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'gban',
        description: "Gère les gbans",
        aliases: ['dev-ban'],
        permissions: [],
        private: true,
        dm: false,
        cooldown: 0
    },
    /**
     * @param {Message} message 
     * @param {Array} args 
     * @param {Client} client 
     */
    run: (message, args, client) => {
        const banned = require('../../assets/data/gbanned.json');

        let arg = args.shift();
        if (arg) {
            let action = "ajouté";

            if (banned.includes(arg)) {action = "retiré"; banned.splice(banned.indexOf(arg), 1);}
            else banned.push(arg);

            functions.reply(message, package.embeds.classic(message.author)
                .setTitle(action[0].toUpperCase() + action.slice(1))
                .setColor("ORANGE")
                .setDescription(`L'id \`${arg}\` a été **${action}** à la liste des GBan`)
            );

            writeFileSync('./assets/data/gbanned.json', JSON.stringify(banned));
        } else {
            functions.reply(message, package.embeds.classic(message.author)
                .setTitle("Liste")
                .setColor("ORANGE")
                .setDescription(banned.map(x => `\`${x}\``).join(' ') || 'aucun gban')
            );
        };
    }
}