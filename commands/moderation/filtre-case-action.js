const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const moment = require('moment');

module.exports.help = {
    name: 'filtre-case-action',
    description: "Filtre les cases de modération selon votre choix.",
    private: false,
    aliases: ['filtre-modlogs'],
    permissions: ['manage_guild'],
    dm: false,
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    const actions = [
        {
            name: 'Bannissements',
            value: 'ban'
        },
        {
            name: 'Avertissements',
            value: 'warn'
        },
        {
            name: 'Réduction au silence',
            value: 'mute'
        },
        {
            name: 'Expulsion',
            value: 'kick'
        },
        {
            name: 'Démutage',
            value: 'unmute'
        },
        {
            name: 'Suppression d\'avertissements',
            value: 'unwarn'
        },
        {
            name: 'Débanissement',
            value: "unban"
        }
    ];

    let action = args[0];
    if (!action) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Pas d'arguments")
        .setColor('#ff0000')
        .setDescription(`Merci de laisser un argument parmis ceux de la liste qui suit: \n${actions.map((x) => `\`${x.name}\``).join(', ')}`)
    ] });
    if (!actions.find((x) => x.name.toLowerCase() === action.toLowerCase())) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Pas d'arguments")
        .setColor('#ff0000')
        .setDescription(`Merci de laisser un argument parmis ceux de la liste qui suit: \n${actions.map((x) => `\`${x.name}\``).join(', ')}`)
    ] });

    action = actions.find((x) => x.name.toLowerCase() === args[0].toLowerCase());

    interaction.client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${message.guild.id}" AND action="${action.value}"`, (err, req) => {
        if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

        if (req.length === 0) return message.channel.send({ content: "Il n'y aucun log à afficher" });

        if (req.length > 5) {
            let now = package.embeds.classic(message.author)
                .setTitle("Logs")
                .setDescription(`Voici la liste des logs de ${action.name}.`)
                .setColor('ORANGE')
                
            var embeds = [];
            let pile = false;
            let count = 0;
                
            for (let i = 0; i < req.length; i++) {
                const warn = req[i];
                    
                now.addField(action, `<@${warn.user_id}>\n> Donné par <@${warn.mod_id}>\n> Raison: \`${warn.reason}\`\n> Date: <t:${moment(warn.date).unix()}:R>`, false);
    
                pile = false;

                count++;
                if (count === 5) {
                    count=0;
                    pile = true;
                    embeds.push(now);
    
                    now = null;
                    now = package.embeds.classic(message.author)
                        .setTitle("Logs")
                        .setDescription(`Voici la liste des logs de ${action}.`)
                        .setColor('ORANGE')
                }
            };
    
            if (!pile) embeds.push(now);
                
            functions.pagination(message.author, message.channel, embeds, `logs de modération`);
        } else {
            const embed = package.embeds.classic(message.author)
                .setTitle("Logs")
                .setColor('ORANGE')
                .setDescription(`Voici la liste des logs de ${action}`)
                
            req.forEach((warn) => {
                embed.addField(action, `<@${warn.user_id}>\n> Donné par <@${warn.mod_id}>\n> Raison: \`${warn.reason}\`\n> Date: <t:${moment(warn.date).unix()}:R>`, false);
            });

            message.channel.send({ embeds: [ embed ] });
        }
    })
}