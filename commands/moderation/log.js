const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const moment = require('moment');

module.exports = {
    help: {
        name: 'log',
        description: "Affiche un log de modération donné",
        aliases: ['log-info'],
        permissions: ['MANAGE_GUILD'],
        cooldown: 5,
        private: false,
        dm: false
    },
    /**
     * @param {Discord.Message} message 
     * @param {Array} args 
     * @param {Discord.Client} client 
     */
    run: (message, args, client) => {
        let number = parseInt(args.shift());
        if (isNaN(number) || number < 0) return functions.reply(message, package.embeds.invalidNumber(message.author));

        client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${message.guild.id}" AND case_id="${number}"`, (err, req) => {
            if (err) {
                functions.sendError("Erreur SQL\n\n" + err, 'log', message.author);
                functions.reply(message, package.embeds.errorSQL(message.author));
                return;
            };

            if (req.length == 0) {
                functions.reply(message, package.embeds.classic(message.author)
                    .setTitle("Log inexistant")
                    .setDescription(`Aucun log ne porte le numéro ${functions.numberToHuman(number)}.`)
                    .setColor('ORANGE')
                );
                return;
            };

            const log = req[0];
            const embed = package.embeds.classic(message.author)
                .setTitle(functions.capitalize(log.action))
                .setDescription(`__**Raison :**__\n${log.reason}

__**Modérateur :**__
<@${log.mod_id}> ( \`${log.mod_id}\` )

__**Utilisateur :**__
<@${log.user_id}> ( \`${log.user_id}\` )

> <t:${moment(log.date).unix()}:R>`)
            .setColor('ORANGE')

            functions.reply(message, embed);
        });
    }
};