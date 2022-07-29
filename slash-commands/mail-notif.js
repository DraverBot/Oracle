const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'mail-notifs',
        description: "Active ou désactive les notifications de mail",
        options: [
            {
                name: 'enable',
                description: "Active les notifications de mail",
                type: 'SUB_COMMAND'
            },
            {
                name: 'disable',
                description: "Désactive les notifications de mail",
                type: 'SUB_COMMAND'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let state = interaction.options.getSubcommand() == 'enable' ? '1' : '0';

        await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] });
        interaction.client.db.query(`SELECT user_id FROM mails_notif WHERE user_id="${interaction.user.id}"`, (err, req) => {
            if (err) {
                console.log(err);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
                functions.sendError(err, 'mail-notifs', interaction.user);
                return;
            };
            let sql = `INSERT INTO mails_notif (user_id, notified) VALUES ("${interaction.user.id}", "${state}")`;
            if (req.length > 0) {
                sql = `UPDATE mails_notif SET notified="${state}" WHERE user_id="${interaction.user.id}"`;
            };

            interaction.client.db.query(sql, (er) => {
                if (er) {
                    console.log(er);
                    interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
                    functions.sendError(er, 'mail-notifs', interaction.user);
                    return;
                };

                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Notifications de mail")
                    .setDescription(`Vous avez **${state == "0" ? "désactivé":'activé'}** les notifications de mail`)
                    .setColor('ORANGE')
                ] });
            })
        })
    }
}