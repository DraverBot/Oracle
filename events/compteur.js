const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'messageCreate',
    /**
     * @param {Discord.Message} message 
     */
    execute: (message) => {
        if (message.author.bot || !message.guild || message.webhookId) return;

        message.client.db.query(`SELECT counting_channel, counting_enable, counting_amount FROM configs WHERE guild_id="${message.guild.id}"`, (err, req) => {
            if (err) return console.log(err);
            
            if (req.length == 0) return;
            const data = req[0];
            if (data.counting_enable == 0) return;
            if (data.counting_channel == null) return;
            if (data.counting_channel !== message.channel.id) return;

            if (message.content.startsWith('"') && message.content.endsWith('"')) return;

            let int = parseInt(message.content);

            const del = (reason) => {
                message.delete().catch(() => {});

                if (functions.random(15, 0) == 5) {
                    const embed = package.embeds.classic(message.author)
                        .setTitle("Message supprimé")
                        .setDescription(`Votre message a été supprimé car ${reason}.`)
                        .setColor('#ff0000')
                        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) || message.author.avatarURL({ dynamic: true }) });
                    
                    message.author.send({ embeds: [ embed ] }).catch(() => {});
                }
            };

            if(int.toString().length !== message.content.length) return del('vous avez envoyé du texte.\nPour faire un commentaire, entourez votre texte de guillemets ( "votre commentaire" )');
            if (isNaN(int)) return del('vous avez envoyé un nombre invalide');

            let stat = parseInt(data.counting_amount);
            if (!int === stat + 1) return del(`vous n'avez pas envoyé le bon nombre ( \`${int.toLocaleString()}\` au lieu de \`${stat.toLocaleString()}\` )`);

            message.client.db.query(`UPDATE configs SET counting_amount="${int}" WHERE guild_id="${message.guild.id}"`, (e) => {
                if (e) console.log(e);
            });
        });
    }
};