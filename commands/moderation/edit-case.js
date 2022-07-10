const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'edit-case',
    description: "Modifie une case de modération",
    aliases: [],
    permissions: ['manage_guild'],
    private: false,
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
    const id = parseInt(args[0]);
    const reason = args.slice(1).join(' ');

    if (!id || isNaN(id)) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
        .setTitle("Pas d'id")
        .setDescription(`Oops, vous n'avez pas saisi l'id de log de modération`)
        .setColor('#ff000')
    ] });

    if (reason.includes('"')) return message.channel.send({ embeds: [ package.embeds.guillement(interaction.user) ] });

    client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${message.guild.id}" AND case_id="${id}"`, (err, req) => {
        if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] }) & console.log(e);

        if (req.length === 0) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Log inexistant")
            .setDescription(`Oops, ce log de modération n'existe pas.\nFaites \`${prefix}modlogs\` pour avoir la liste.`)
            .setColor('#ff0000')
        ] });
        client.db.query(`UPDATE mod_cases SET reason="${reason}" WHERE guild_id="${message.guild.id}" AND case_id="${id}"`, (e) => {
            if (e) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] }) & console.log(e);

            message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Modifié")
                .setDescription(`J'ai modifié le log numéro \`${id}\` avec la raison \`\`\`${reason}\`\`\``)
                .setColor('GREEN')
            ] });
        });
    });
};