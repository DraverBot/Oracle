const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'pile-ou-face',
    description: "Lance une pièce pour le pile ou face",
    aliases: ['pof', 'pileouface'],
    permissions: [],
    cooldown: 5,
    private: false,
    dm: true
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args) => {
    message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Préparez-vous")
        .setDescription(`Préparez-vous au lancement ${package.emojis.loading}`)
        .setColor('ORANGE')
    ] }).then((msg) => {
        setTimeout(() => {
            let percent = Math.floor(Math.random() * 100);
            let result = 'pile';

            if (percent > 49) result = 'face';
            const embed = package.embeds.classic(message.author)
                .setTitle(result)
                .setImage(`attachment://piece-${result}.jpg`)
                .setColor(message.guild ? message.guild.me.displayHexColor : 'ORANGE')

            msg.edit({ embeds: [ embed ] , files: [ `./assets/images/piece-${result}.jpg` ] })
        }, 2500)
    });
}