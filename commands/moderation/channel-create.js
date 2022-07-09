const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'create-channel',
    aliases: ['channel-create'],
    permissions: ["manage_channels"],
    description: "Permet de créer un salon",
    cooldown: 5,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args) => {
    let name = args.shift();
    let type = args.shift();
    let parentId = args.shift();

    var inexistant = [];
    if (!name) inexistant.push('name');
    if (!type) inexistant.push('type');
    if (!parentId) inexistant.push('parentId');

    const types = ['text', 'voice', 'news'];

    const isParent = (id) => {
        const parent = message.guild.channels.cache.find((x) => x.id === id && x.type === "GUILD_CATEGORY");
        if (!parent) return false;
        return true;
    };

    const create = () => {
        if (!name) return functions.lineReply(message.id, message.channel, `Veuillez saisir un nom.`);
        if (!types.includes(type.toLowerCase())) return functions.lineReply(message.id, message.channel, "Le type est soit \`text\` soit \`voice\` soit \`news\`." );
        if (!isParent(parentId) && parentId.toLowerCase() !== 'none') return functions.lineReply(message.id, message.channel, "Veuillez saisir un **identifiant** de catégorie.");
        
        const needParent = parentId.toLowerCase() === 'none' ? false : true;
        message.guild.channels.create(name, {
            type: `GUILD_${type.toUpperCase()}`
        }).then((x) => {
            if (needParent) x.setParent(message.guild.channels.cache.find((y) => y.id === parentId && y.type === "GUILD_CATEGORY"));
            x.send({ content: `Salon crée par <@${message.author.id}>` })
            
            functions.lineReply(message.id, message.channel, "Salon crée " + `<#${x.id}>`);
        });
    }

    if (inexistant.length === 0) {
        create();
    } else {
        const msgs = {
            name: 'Quel est le nom du salon ?',
            type: "Quel est le type du salon ? Utilisez `text`, `voice` ou `news`",
            parentId: `Dans quelle catégorie le salon doit-il être crée ? Répondez par \`none\` pour aucune catégorie.`
        };
        let step = inexistant.shift();
        message.channel.send({ content: msgs[step] }).then((menu) => {
            var trash = [ menu ];
            const collector = message.channel.createMessageCollector({ time: 120000, filter: x => x.author.id === message.author.id });

            collector.on('collect', (msg) => {
                trash.push(msg);
                if (msg.content.toLowerCase() === 'cancel') return collector.stop('cancel');

                if (step === 'name') {
                    name = msg.content;
                    if (inexistant.length > 0) {
                        step = inexistant.shift();
                        message.channel.send({ content: msgs[step] }).then(x => trash.push(x));
                    } else {
                        collector.stop('ended');
                    };
                    return;
                };
                if (step === 'type') {
                    if (msg.content.toLowerCase() !== ('text' || 'news' || 'voice')) {
                        message.channel.send({ content: "Le type ne peut être que \`text\`, `news` ou `voice`" }).then((x) => {
                            trash.push(x);
                        });
                        return;
                    };
                    type = msg.content;
                    
                    if (inexistant.length > 0) {
                        step = inexistant.shift();
                        message.channel.send({ content: msgs[step] }).then(x => trash.push(x));
                    } else {
                        collector.stop('ended');
                    };
                    return;
                };
                if (step === 'parentId') {
                    let test = message.guild.channels.cache.find((x) => (x.id === msg.content || x.name === msg.content) && x.type === 'GUILD_CATEGORY');
                    if (!test && msg.content.toLowerCase() !== "none") {
                        message.channel.send({ content: "Merci de saisir un identifiant ou un nom de catégorie." }).then((x) => {
                            trash.push(x);
                        });
                        return;
                    };

                    parentId = test !== undefined ? test.id : 'none'
                    collector.stop('ended');
                    return;
                };
            });

            collector.on('end', (collected, reason) => {
                trash.forEach((x) => {
                    x.delete().catch(() => {});
                });
                if (reason === 'cancel') return message.channel.send({ embeds: [ package.embeds.cancel() ] });
                if (reason === 'ended') {
                    create();
                };
            });
        });
    };
};