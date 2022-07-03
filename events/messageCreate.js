const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'messageCreate',
    /**
     * @param {Discord.Message} message 
     */
    execute: (message) => {
        if (message.author.bot) return;
        if (message.mentions.has(message.client.user.id) && !message.mentions.everyone) {
            let splashes = require('../assets/data/splash.json').filter(x => !x.includes('weird'));
            
            if (!functions.random({ max: 200 }) === 132) {
                const index = splashes.indexOf(x => x === 'This is an easter egg !');
                splashes.splice(index, 1);
            };
            let size = require('../assets/data/splash.json').length;
            
            let splash = splashes[(functions.random(splashes.length * 2) / 2).toFixed(0)].replace('{username}', message.author.username)
            .replace('{size}', size);
    
            const reponse = package.embeds.classic(message.author)
                .setTitle(splash)
                .setDescription(`Bonjour ! Je suis Oracle.\nUtilisez mes slash commandes pour que je vous aide.\n:bulb:\n> Commencez à taper \`/\` dans le chat pour voir la liste des mes commandes..`)
                .setColor(message.guild.me.displayHexColor)
                .setAuthor({ name: "Oracle", iconURL: message.author.displayAvatarURL({ dynamic: true }) })
    
            if (splash === "Click on the link") {
                reponse.setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            }; 
            
            functions.reply(message, reponse);
    
            if (message.guild) {
                if ((message.guild.me.nickname === 'Dinnerbone' || message.guild.me.nickname === 'Grumm') && functions.random(10, 0) === 5) {
                    const reverse = (text) => {
                        let t ="";
                        for (let i =0;i<text.length;i++) {
                            t = text[i] + t;
                        };
    
                        return t;
                    }
                    message.channel.send({ content: reverse(`C'est le monde à l'envers !`) })
                }
            }
        }
    }
}