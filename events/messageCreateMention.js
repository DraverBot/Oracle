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
            
            let splash = splashes[functions.random(splashes.length, 0)].replace('{username}', message.author.username);
            splash.replace('{size}', size);

            const reponse = package.embeds.classic(message.author)
                .setTitle(splash)
                .setDescription(`Bonjour ! Je suis fait en slash commandes, alors mon préfixe est (\`/\`) comme beaucoup d'autres bots !\n\nFaites \`/help\` pour obtenir de l'aide.\n\n:bulb: <@${message.client.user.id}> est désormais disponible en slash commands !\n> Si vous ne voyez pas mes slash commands, réinvitez moi par le lien de la commande \`/invite\`.`)
                .setColor(message.guild.me.displayHexColor)
                .setAuthor({ name: message.guild ? message.guild.me.nickname ? message.guild.me.nickname :'Oracle' : "Oracle", iconURL: message.author.displayAvatarURL({ dynamic: true }) })

            if (splash === "Click on the link") {
                reponse.setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            }; 
            
            functions.reply(message, reponse);

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