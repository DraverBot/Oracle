const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'mail-envoi',
        description: "Envoie un mail à un utilisateur",
        aliases: ['msend', 'menvoi', 'e-mail'],
        permissions: [],
        dm: false,
        private: false,
        cooldown: 10
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     * @param {Discord.Client} client 
     * @param {String} prefix 
     */
    run: async(message, args, client, prefix) => {
        let data = {
            object: null,
            content: null,
            user: null
        };
        await message.guild.members.fetch();

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

        let step = 'user';

        send({embeds: [ package.embeds.classic(message.author).setTitle("Utilisateur")
    .setDescription(`Quel est l'utilisateur qui doit recevoir le mail ?\nUtilisez une mention ou un identifiant.\n> Vous avez 3 minutes pour répondre. Tapez \`cancel\` à tout moment pour annuler`)
.setColor('ORANGE') ]});
        const collector = message.channel.createMessageCollector({ filter: x => x.author.id === message.author.id, time: 180000 });

        collector.on('collect', (msg) => {
            trash.set(msg.id, msg);
            if (msg.content === 'cancel') return collector.stop('cancel');

            if (step === 'user') {
                let test = msg.mentions.members.first() || message.guild.members.cache.get(msg.content);

                if (!test) return send({ embeds: [ package.embeds.noUser(message.author) ] });
                data.user = test.user;
                send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Objet")
                    .setDescription(`> Quel est l'objet du mail ?`)
                    .setColor('ORANGE')
                ] });
                step = 'object';
                return;
            };
            if (step === 'object') {
                if (msg.content.includes('"')) return send({ embeds: [ package.embeds.guillement(message.author) ] });
                if (msg.content.length > 50) return send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Objet")
                    .setDescription(`L'objet du mail doit être inférieur ou égal à **50 caractères**`)
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

        collector.on('end', (collected, reason) => {
            message.channel.bulkDelete(trash);
            if (reason === 'cancel') return cleanSend({ embeds: [ package.embeds.cancel() ] });
            if (reason === 'ended') {
                return client.MailsManager.send(data.user, message.channel, data.content, data.object, message.author, false);
            };
            message.channel.send({ embeds: [ package.embeds.collectorNoMessage(message.author) ] }).catch(() => {});
        });
    }
};