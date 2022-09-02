const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions: ['manage_guild'],
        systems: [],
        dev: false,
        dm: false
    },
    configs: {
        name: 'note',
        description: "Système de notes de membres",
        options: [
            {
                name: 'lire',
                description: "Lis la note d'un membre",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "membre",
                        type: 'USER',
                        description: "Membre dont vous voulez lire la note",
                        required: true
                    }
                ]
            },
            {
                name: "écrire",
                description: "Écrit une note pour un membre",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'membre',
                        description: "Membre que vous voulez noter",
                        required: true,
                        type: 'USER'
                    },
                    {
                        name: 'note',
                        description: "Note à mettre sur le membre",
                        required: true,
                        type: 'STRING'
                    }
                ]
            },
            {
                name: "supprimer",
                description: "Supprime la note d'un membre",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "membre",
                        description: "Membre dont vous voulez supprimer la note",
                        type: 'USER',
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
        const subcommand = interaction.options.getSubcommand();
        let member = interaction.options.getMember('membre');
        const condition = `WHERE guild_id="${interaction.guild.id}" AND user_id="${member.id}"`;

        if (!functions.checkPerms({ interaction, member, mod: interaction.member, checkOwner: true, checkBot: true, checkSelfUser: true })) return;
        await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] }).catch(() => {});

        interaction.client.db.query(`SELECT note FROM notes ${condition}`, (err, req) => {
            if (err) {
                functions.sendError(err, 'query fetch at /note', interaction.user);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                return;
            };

            if (subcommand == 'lire') {
                if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Pas de notes")
                    .setDescription(`<@${member.id}> n'a pas de note`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Note")
                    .setDescription('```' + req[0].note + '```')
                    .setColor(member.displayHexColor)
                ] }).catch(() => {});
            };
            if (subcommand == 'écrire') {
                let note = interaction.options.getString('note');
                if (note.length > 255) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Note trop longue")
                    .setDescription(`Votre description fait **${note.length}** caractères, le maximum étant de **255**`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                note = note.replace('"', '\\"');
                let sql = `INSERT INTO notes (guild_id, user_id, note) VALUES ("${interaction.guild.id}", "${member.id}", "${note}")`;
                if (req.length > 0) sql = `UPDATE notes SET note="${note}" ${condition}`;

                interaction.client.db.query(sql, (error) => {
                    if (error) {
                        functions.sendError(error, 'query set at /notes écrire', interaction.user);
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                        console.log(error);
                        return;
                    };

                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Note modifiée")
                        .setDescription(`La note de <@${member.id}> a été modifiée en \`\`\`${note}\`\`\``)
                        .setColor(member.displayHexColor)
                    ] }).catch(() => {});
                    const fields = [
                        {
                            name: "Modérateur",
                            value: `<@${interaction.user.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`,
                            inline: true
                        },
                        {
                            name: "Membre",
                            value: `<@${member.id}> ( ${member.user.tag} \`${member.id}\` )`,
                            inline: true
                        }
                    ];
                    if (req.length > 0) {
                        fields.push({
                            name: "Avant",
                            value: req[0].note,
                            inline: false
                        },
                        {
                            name: "Après",
                            value: note,
                            inline: true
                        })
                    } else {
                        fields.push({
                            name: "Note",
                            value: note,
                            inline: false
                        });
                    };

                    functions.log(interaction.guild, package.embeds.classic(interaction.user)
                        .setTitle("Note modifiée")
                        .setDescription(`Une note a été modifiée`)
                        .addFields(fields)
                        .setColor('YELLOW')
                    );
                });
            };
            if (subcommand == 'supprimer') {
                if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Pas de notes")
                    .setDescription(`<@${member.id}> n'a pas de note`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                interaction.client.db.query(`DELETE FROM notes ${condition}`, (error) => {
                    if (error) {
                        functions.sendError(error, 'query set at /notes supprimer', interaction.user);
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                        console.log(error);
                        return;
                    };

                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Note modifiée")
                        .setDescription(`La note de <@${member.id}> a été supprimée`)
                        .setColor(member.displayHexColor)
                    ] }).catch(() => {});
                    const fields = [
                        {
                            name: "Modérateur",
                            value: `<@${interaction.user.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`,
                            inline: true
                        },
                        {
                            name: "Membre",
                            value: `<@${member.id}> ( ${member.user.tag} \`${member.id}\` )`,
                            inline: true
                        },
                        {
                            name: "Note",
                            value: req[0].note,
                            inline: false
                        }
                    ];

                    functions.log(interaction.guild, package.embeds.classic(interaction.user)
                        .setTitle("Note supprimée")
                        .setDescription(`Une note a été supprimée`)
                        .addFields(fields)
                        .setColor('#ff0000')
                    );
                })
            };
        });
    }
};