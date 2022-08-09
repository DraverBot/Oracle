const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'sql',
    description: "Fait une requete sql",
    aliases: ['mysql'],
    permissions: [],
    private: true,
    dm: true,
    cooldown: 0
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = (message, args, client, prefix) => {
    message.delete().catch(() => {});

    const sql = args.join(' ');
    if (!sql) return message.channel.send({ content: "Merci de préciser la requete sql" });

    client.db.query(sql, (error, request) => {
        if (error) {
            message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Erreur")
                .setColor('#ff0000')
                .setDescription(`\`\`\`${error}\`\`\``)
            ] });

            return;
        };

        message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("SQL")
            .setColor('GREEN')
            .setDescription(`\`\`\`${JSON.stringify(request) || request}\`\`\``)
            .setAuthor({ name: `${request.length} résultats` })
        ] });
    });
};