const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'suggestion',
        description: "Envoie une suggestion **dans le salon actuel**",
        aliases: ['suggest'],
        permissions: [],
        private: false,
        dm: false,
        cooldown: 5
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: (message, args, client, prefix) => {
        message.delete().catch(() => {});

        let suggestion = args.join(' ');
        if(!suggestion) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Pas de suggestion")
            .setColor("#ff0000")
            .setDescription(`Veuillez préciser une suggestion lors de l'exécution de la commande.

\`${prefix}suggestion Faire un système de suggestions\``)
        ] });

        message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Suggestion")
            .setDescription(`Nouvelle **suggestion** de <@${message.author.id}>

> ${suggestion}`)
            .setColor(message.guild.me.displayHexColor)
        ] }).then(async(x) => {
            [ 'gsyes', 'gsno' ].forEach(async(y) => {
                await x.react(package.emojis[y]);
            });
        });
    }
};