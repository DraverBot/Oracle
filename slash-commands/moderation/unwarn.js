const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions: ['gérer le serveur'],
        systems: [],
        dev: false,
        dm: false
    },
    configs: {
        name: 'unwarn',
        description: "Enlève un avertissement à un utilisateur",
        options: [
            {
                name: 'membre',
                type: 'USER',
                description: "Membre qui aura un avertissement en moins",
                required: true
            },
            {
                name: 'identifiant',
                description: 'Identifiant de l\'avertissement (visible avec /logs afficher)',
                type: 'INTEGER',
                required: true
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let member = interaction.options.getMember('membre');
        let id = interaction.options.get('identifiant').value;

        if (!functions.checkPerms({ interaction, member, mod: interaction.member, all: true })) return;
        await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] }).catch(() => {});

        interaction.client.db.query(`SELECT * FROM mod_cases WHERE id="${id}" AND action="avertissement" AND user_id="${member.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, 'query fetch at /unwarn', interaction.user);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                return;
            };
            if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle('Avertissement inexistant')
                .setDescription(`L'avertissement d'identifiant \`${id}\` à <@${member.id}> n'existe pas`)
                .setColor('#ff0000')
            ] }).catch(() => {});
            interaction.client.db.query(`DELETE FROM mod_cases WHERE id="${id}"`, (error) => {
                if (error) {
                    functions.sendError(error, 'query delete at /unwarn', interaction.user);
                    interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    return;
                };

                const embed = package.embeds.classic(interaction.user)
                    .setTitle("Suppression d'avertissement")
                    .setDescription(`L'avertissement d'identifiant \`${id}\` a été supprimé`)
                    .addFields(
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
                            name: "Raison",
                            value: `Raison de l'avertissement :\`\`\`${req[0]?.reason ?? 'Pas de raison'}\`\`\``,
                            inline: true
                        }
                    )
                    .setColor('#ff0000')
                
                interaction.editReply({ embeds: [ embed ] }).catch(() => {});
                functions.log(interaction.guild, embed);
                functions.addCase(interaction.guild.id, member.id, interaction.user.id, req[0]?.reason ?? 'pas de raison', "unwarn");
            });
        });
    }
};