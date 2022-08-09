const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'sendglobalmail',
        description: "Envoie un mail à tous les utilisateurs",
        aliases: [],
        permissions: [],
        private: true,
        dm: false,
        cooldown: 10
    },
    /**
     * 
     * @param {Discord.Message} message 
     * @param {Array} args 
     * @param {Discord.Client} client 
     */
    run: (message, args, client) => {
        let data = {
            object: null,
            content: null,
        };

        let trash = new Discord.Collection();

        const send = (data, deleteTimeout) => {
            message.channel.send(data).then((x) => {
                if (!deleteTimeout) return trash.set(x.id, x);
                setTimeout(x.delete, deleteTimeout);
            });
        };
        const cleanSend = data => {
            message.channel.send(data);
        };

        let step = 'object';

        send({embeds: [ package.embeds.classic(message.author).setTitle("Objet")
    .setDescription(`Quel est l'objet du mail ?\n> Vous avez 3 minutes pour répondre. Tapez \`cancel\` à tout moment pour annuler`)
.setColor('ORANGE') ]});
        const collector = message.channel.createMessageCollector({ filter: x => x.author.id === message.author.id, time: 180000 });

        collector.on('collect', (msg) => {
            trash.set(msg.id, msg);
            if (msg.content === 'cancel') return collector.stop('cancel');

            if (step === 'object') {
                if (msg.content.includes('"')) return send({ embeds: [ package.embeds.guillement(message.author) ] });
                if (msg.content.length > 50) return send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Objet")
                    .setDescription(`> L'objet du mail doit être inférieur ou égal à **50 caractères**`)
                    .setColor('ORANGE')
                ] });
                data.object = msg.content;

                send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Contenu")
                    .setDescription(`Quel est le contenu du mail ?`)
                    .setColor('ORANGE')
                ] });
                step = 'content';
                return;
            };
            if (step === 'content') {
                if (msg.content.includes('"')) return send({ embeds: [ package.embeds.guillement(message.author) ] });
                data.content = msg.content;
                collector.stop('ended');
            };
        });

        collector.on('end', async(collected, reason) => {
            message.channel.bulkDelete(trash);
            if (reason === 'cancel') return cleanSend({ embeds: [ package.embeds.cancel() ] });
            if (reason === 'ended') {
                await client.guilds.fetch();
                let sent = new Discord.Collection();

                client.guilds.cache.forEach(async(guild) => {
                    await guild.members.fetch();
                    guild.members.cache.forEach((member) => {
                        if (sent.has(member.id)) return;
                        sent.set(member.id, member);

                        const user = member.user;
                        if (user.bot) return;
                        client.MailsManager.sendImportantMail(user, message.channel, data.content, data.object, message.author);
                    });
                });

                return;
            };
            message.channel.send({ embeds: [ package.embeds.collectorNoMessage(message.author) ] }).catch(() => {});
        });
    }
}