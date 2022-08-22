const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'messageCreate',
    execute: (message) => {
        if (message.author.bot) return;
        if (message.mentions.users.has(message.client.user.id) && !message.mentions.everyone) {
            let splashes = require('../assets/data/splash.json').filter(x => !x.includes('weird'));

            if (!functions.random(200, 0) === 132) {
                const index = splashes.indexOf(x => x === 'This is an easter egg !');
                splashes.splice(index, 1);
            };
            let size = require('../assets/data/splash.json').length;
            
            let splash = splashes[functions.random(splashes.length, 0)].replace('{username}', message.author.username)
            .replace('{size}', size);

            const reponse = package.embeds.classic(message.author)
                .setTitle(splash)
                .setDescription(`Bonjour ! Je suis fait en slash commandes, alors mon préfixe est \`/\` (comme beaucoup d'autres bots !)\n\nFaites \`/help\` pour obtenir de l'aide.\n\n:bulb: <@${message.client.user.id}> est désormais disponible en slash commands !\n> Si vous ne voyez pas mes slash commands, réinvitez moi par le lien de la commande \`/invite\`.`)
                .setColor(message.guild.me.displayHexColor)
                .setAuthor({ name: message.guild ? message.guild.me.nickname ? message.guild.me.nickname :'Oracle' : "Oracle", iconURL: message.author.displayAvatarURL({ dynamic: true }) })

            if (["Click on the link", "We finally published the source code !", "Don't click"].includes('splash')) {
                reponse.setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            }; 
            
            let row = new ActionRowBuilder();
            let buttons = [];
            if (functions.random(10, 0) == 5) {
                let support = new ButtonBuilder()
                    .setLabel('Serveur de support')
                    .setStyle(ButtonStyle.Link)
                    .setURL(package.configs.support)
                buttons.push(support);
            };
            if (functions.random(10, 0) == 5) {
                let invite = new ButtonBuilder()
                    .setLabel('Inviter Oracle')
                    .setStyle(ButtonStyle.Link)
                    .setURL(package.configs.link)
                
                if (buttons.length == 0) {
                    buttons.push(invite)
                } else {
                    if (functions.random(100, 0) >= 50) {
                        buttons.push(invite);
                    } else {
                        buttons.unshift(invite);
                    };
                };
            };
            if (functions.random(10, 0) == 5 && buttons.length < 2) {
                let topgg = new ButtonBuilder()
                    .setLabel('Page top.gg')
                    .setStyle(ButtonStyle.Link)
                    .setURL(package.configs.topgg)
                    
                if (buttons.length == 0) {
                    buttons.push(topgg)
                } else {
                    if (functions.random(100, 0) >= 50) {
                        buttons.push(topgg);
                    } else {
                        buttons.unshift(topgg);
                    };
                };
            }
            row.addComponents(buttons);
            functions.reply(message, reponse, row);

            if (message.guild) {
                if (functions.random(10000, 0) === 794) {
                    message.guild.me.setNickname(`Oralce`);
                };
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
        };

    }
}