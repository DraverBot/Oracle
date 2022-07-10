const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'game-number',
    description: "Jouez à guess the number directement sur Discord. Peut se jouer à plusieurs en ajoutant multijoueur",
    aliases:['guess-the-number'],
    permissions: [],
    cooldown: 5,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message
 * @param {Array} args
 */
module.exports.run = (message, args) => {
    let filter;
    let multi = false;

    var konamiCodes = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
    const allowed = ['up', 'down', 'left', 'right', 'b', 'a']

    if (args.length !=0 && args[0].toLowerCase() == ('multijoueur' || 'player')) {
        filter = (m) => !m.author.bot;
        multi = true;
    }
    else filter = (m) => m.author.id === message.author.id && !m.author.bot;

    let randomNumber = Math.floor(Math.random() * 99) + 1;
    let countsTry = 0;

    const collector = message.channel.createMessageCollector({ filter: filter, time: 120000 });
    message.channel.send({ content: `${multi ? "J" : `<@${message.author.id}>, j`}'ai choisi mon nombre aléatoire entre 1 et 100. ` });

    var usersInKonamiStart = {};


    collector.on('collect', (msg) => {
        let number = parseInt(msg.content);

        if (msg.content.toLowerCase() == 'cancel') return collector.stop('cancel');

        if (isNaN(number)) {
            if (allowed.includes(msg.content.toLowerCase())) {
                if (!usersInKonamiStart[msg.author.id]) {
                    usersInKonamiStart[msg.author.id] = {
                        step: -1,
                        cheatMod: false
                    };
                };

                usersInKonamiStart[msg.author.id].step+=1;

                if (!msg.content.toLowerCase() == konamiCodes[usersInKonamiStart[msg.author.id].step]) {
                    usersInKonamiStart[msg.author.id].step = -1
                }
                if (usersInKonamiStart[msg.author.id].step > 8) {
                    usersInKonamiStart[msg.author.id].cheatMod = !usersInKonamiStart[msg.author.id].cheatMod

                    msg.author.send({ content: `Vous avez activé le konami code !` }).catch(() => {});
                };
                
                return functions.lineReply(msg.id, message.channel, `:x: Ce n'est pas un nombre valide`, false);
            } else {
                return functions.lineReply(msg.id, message.channel, `:x: Ce n'est pas un nombre valide`, false);
            }
        };

        if (usersInKonamiStart[msg.author.id] && usersInKonamiStart[msg.author.id].cheatMod) randomNumber = number;

        if (number < randomNumber) {
            functions.lineReply(msg.id, message.channel, `Mon nombre est plus grand`);
        } else if (number > randomNumber) {
            functions.lineReply(msg.id, message.channel, `Mon nombre est plus petit`);
        } else if (number === randomNumber) {
            functions.lineReply(msg.id, message.channel, 'Vous avez trouvé mon nombre :"D');
            return collector.stop('won');
        };

        countsTry++
        if (countsTry == 15) return collector.stop('ended');
    });

    collector.on('end', (collected, reason) => {
        if (reason == 'ended') {
            message.channel.send({ content: `Les 15 essais sont passés, mon nombre était ${randomNumber}, dommage` });
        } else if (reason == 'cancel') {
            message.channel.send({ embeds: [ package.embeds.cancel() ] }).catch(() => {});
        }
    })
}