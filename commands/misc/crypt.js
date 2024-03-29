const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const cryptor = require('../../assets/scripts/vigenereCode');

module.exports = {
    help: {
        name: 'crypt',
        description: "Crypte un texte selon le code de vigenere",
        aliases: ['encrypt'],
        permissions: [],
        private: false,
        dm: false,
        cooldown: 5
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     */
    run: (message, args) => {
        let text = args.join(' ');

        if (!text) return functions.lineReply(message.id, message.channel, "Veuillez préciser un texte dans votre commande");

        message.channel.send({ content: "Quelle est la clé selon le code doit-être chiffré ?\nL'agument peut être une phrase ou un mot.\n> Utilisez \`cancel\` pour annuler." }).then((sent) => {
            const collector = message.channel.createMessageCollector({ filter: x => x.author.id == message.author.id, max: 1, time: 120000 });
            collector.on('end', (collected) => {
                sent.delete().catch(() => {});
                message.delete().catch(() => {});

                if (collected.size == 0) return message.channel.send({ embeds: [ package.embeds.cancel() ] }).catch(() => {});

                collected.first().delete().catch(() => {});
                let crypted = new cryptor(text, collected.first().content, 'code').run();

                message.author.send({ content: `Voici le message crypté selon la clé \`${collected.first().content}\` :\`\`\`${crypted}\`\`\`` }).catch(() => {});
            });
        });
    }
};