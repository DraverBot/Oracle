const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'prefixe',
        description: "Configure ou modifie le préfixe de votre serveur",
        options: [
            {
                name: "view",
                description: "Affiche le préfixe du serveur",
                type: 'SUB_COMMAND'
            },
            {
                name: 'set',
                description: "Configure le préfixe du bot sur votre serveur",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'nouveau_prefixe',
                        description: "Nouveau préfixe du bot",
                        type: 'STRING',
                        required: true
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Désolé, cette commande n'est exécutable que sur un serveur" });
        if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, 'gérer le serveur') ] }).catch(() => {});
        await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] });

        interaction.client.db.query(`SELECT prefix FROM prefixes WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, '/prefix', interaction.user);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
            };

            let subCommand = interaction.options.getSubcommand();
            if (subCommand == 'view') {
                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Préfixe")
                    .setDescription(`Mon préfixe sur ${interaction.guild.name} est \`${req.length > 0 ? req[0].prefix : package.configs['default_prefix']}\``)
                    .setColor(interaction.guild.me.displayHexColor)
                 ] });
            } else {
                let prefix = interaction.options.getString('nouveau_prefixe');
                if (prefix.includes('"') || prefix.length > 255) return interaction.editReply({ embeds: [ package.embeds.noText(interaction.user)] });

                let sql = req.length == 0 ? `INSERT INTO prefixes (guild_id, prefix) VALUES ("${interaction.guild.id}", "${prefix}")`:`UPDATE prefixes SET prefix="${prefix}" WHERE guild_id="${interaction.guild.id}"`;
                interaction.client.db.query(sql, (error, request) => {
                    if (error) {
                        functions.sendError(err, '/prefix', interaction.user);
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
                    };

                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Préfixe modifié")
                        .setDescription(`Le préfixe de ${interaction.guild.name} a été **modifié** en \`${prefix}\``)
                        .setColor(interaction.guild.me.displayHexColor)
                    ] }).catch(() => {});
                });
            }
        });
    }
}