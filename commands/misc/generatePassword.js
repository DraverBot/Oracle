const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'generatepassword',
    aliases: ['getpassword'],
    permissions: [],
    description: "Vous génère un mot de passe aléatoire plus ou moins sécurisé en fonction de vos choix",
    cooldown: 5,
    private: false,
    dm: true
};

/**
 * @param {Discord.Message} message
 */
module.exports.run = (message) => {
    const filter = (m) => m.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({ filter: filter, time: 120000 });

    var trash = [];
    const send = (x) => {
        message.channel.send({ content: x }).then((y) => {
            trash.push(y);
        });
    };

    var data = {
        length: null,
        majs: null,
        special: null,
        numbers: null
    };
    let step = 'length';
    send(`Quelle est la longueur de votre mot de passe ?`);
    
    collector.on('collect', (msg) => {
        trash.push(msg);

        if (msg.content.toLowerCase() === 'cancel') return collector.stop('cancel');

        if (step === 'special') {
            if (msg.content.toLowerCase() !== ("oui" || 'non')) return send(`Veuillez répondre par oui ou par non`);

            if (msg.content.toLowerCase() == 'oui') data.special = true
            else data.special = false;

            collector.stop('finished')
        };
        if (step == 'numbers') {
            if (msg.content.toLowerCase() !== ("oui" || 'non')) return send(`Veuillez répondre par oui ou par non`);

            if (msg.content.toLowerCase() == 'oui') data.numbers = true
            else data.numbers = false;

            send(`Votre mot de passe doit-il contenir des caractères spéciaux (comme des tirets par exemple) ? \`oui\`/\`non\``);
            step = 'special';
        }
        if (step === 'majs') {
            if (msg.content.toLowerCase() !== ("oui" || 'non')) return send(`Veuillez répondre par oui ou par non`);

            if (msg.content.toLowerCase() == 'oui') data.majs = true
            else data.majs = false;

            send(`Votre mot de passe doit-il contenir des chiffres ? \`oui\`/\`non\``);
            step = 'numbers';
        };
        if (step === 'length') {
            let number = parseInt(msg.content);
            if (isNaN(number)) return send(`:x: Ce n'est pas un nombre valide.`);
            data.length = number;

            send('Votre mot de passe doit-il contenir des majuscules ? \`oui\`/\`non\`');
            step = 'majs';
        };
    });

    collector.on('end', (c, reason) => {
        trash.forEach((x) => {
            x.delete().catch(() => {})
        });

        if (reason === 'cancel') return message.channel.send({ embeds: [ package.embeds.cancel() ] });
        if (reason === 'finished') {
            var caracts = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            var majs = caracts.map(x => x.toUpperCase());
            var numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            var special = ['&', '{', '}', '(', ')', '[', ']', '-', '_', '/', '\\', '=', '+', '-', '€', '%', '$', '!', '?', '.', ':', ';', ',', '<', '>'];

            const all = {
                "majs": majs,
                'numbers': numbers,
                'special': special
            };

            const corres = {
                0: caracts,
            };

            for (let i = 1; i < 4; i++) {
                const keys = Object.keys(data);
                if (data[keys[i]]) corres[i] = all[keys[i]];
            };

            let password = '';
            for (let i = 1; i < data.length; i++) {
                let max = Object.keys(corres).length;
                let indexForArray = Math.floor(Math.random() * max);
                
                let array = corres[indexForArray];
                let caract = array[Math.floor(Math.random() * array.length)];

                password = password + caract;
            };

            message.author.send({ content: `Voici votre mot de passe généré :\`${password}\`` })
        }
    })
}