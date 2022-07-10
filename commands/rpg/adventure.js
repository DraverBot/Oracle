const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'adventure',
    aliases: ['aventure'],
    description: "Obtenez les infos sur le RPG",
    permissions: [],
    cooldown: 5,
    private: false,
    dm: true
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    client.db.query(`SELECT * FROM rpg WHRE user_id="${message.author.id}"`, (err, req) => {
        if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

        const subCommand = (args.shift() || 'help').toLowerCase();
        
        if (subCommand === 'contexte') {

        } if (subCommand === 'rules') {

        } else if (subCommand === 'start') {
            if (!req.length === 0) return message.channel.send({ content: `${functions.getPersonnage('exelo')} \`\`\`Tu as déjà commencé ton aventure.\`\`\`` });
            
            let name;
            const trash = new Discord.Collection();
            message.channel.send({ content: `${functions.getPersonnage('tengaro')} \`\`\`Bonjour, puis-je vous demander votre nom ?\nTapez cancel pour annuler.\`\`\`` }).then((x) => {
                trash.set(x.id, x);

                const collector = message.channel.createMessageCollector({ filter: x => x.author.id === message.author.id, time: 120000, max: 1 });
                collector.on('collect', (msg) => {
                    trash.set(msg.id, msg);
                    if (msg.content.toLowerCase() === 'cancel') return collector.stop('cancel');

                    name = msg.content;
                });
                collector.on('end', (c, reason) => {
                    message.channel.bulkDelete(trash);
                    if (reason === 'cancel') return message.channel.send({ embeds: [ package.embeds.cancel() ] });

                    if (name !== null) {
                        message.channel.send({ content: `${functions.getPersonnage('tengaro')}\`\`\`Bonjour ${name} !\`\`\`` });
                        
                        const texts = [
                            `${zelda} ${name}, c'est moi qui ai gagné ^^ je t'offre ce \`petit bouclier\`, il te va très bien ! Ho, mais allons donner l'épée au Roi.`
                        ];

                        functions.rpgPagination(message.channel, message.author, );
                    };
                });
            });
        } else {
            const help = package.embeds.classic(message.author)
                .setTitle("Aide aventure")
                .setDescription(`Commande: \`${prefix}aventure\`\n\nObtenez des informations sur l'aventure !\nSous-commandes: \`contexte\`, \`start\`, \`rules\``)
                .setColor('ORANGE')
    
            message.channel.send({ embeds: [ help ] });
        } 
    })
};