const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        systems: [{name: "de rôles d'arrivée", value: "roles_enable", state: true}],
        permissions: ['manage_guild', 'manage_roles'],
        dev: false,
        dm: false
    },
    configs: {
        name: "autorole",
        description: "Gère les rôles donnés automatiquement à l'arrivée sur le serveur",
        options: [
            {
                name: "ajouter",
                description: "Ajoute un rôle automatiquement donné",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "rôle",
                        description: "Rôle à ajouter",
                        type: 'ROLE',
                        required: true
                    }
                ]
            },
            {
                name: "retirer",
                description: "Retirer un rôle automatiquement donné",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "rôle",
                        description: "Rôle à retirer",
                        type: 'ROLE',
                        required: true
                    }
                ]
            },
            {
                name: "liste",
                description: "Affiche la liste des rôles automatiques",
                type: "SUB_COMMAND"
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    run: async(interaction) => {
        const subcommand = interaction.options.getSubcommand();

        await interaction.reply({ embeds: [ package.embeds.waitForDb(interaction.user) ] }).catch(() => {});
        interaction.client.db.query(`SELECT role_id FROM roles_start WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, 'query fetch at /autorole', interaction.user);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                return;
            };

            if (subcommand == 'liste') {
                if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Aucun rôle automatique")
                    .setDescription(`Aucun rôle automatique n'a été configuré`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                const embed = package.embeds.classic(interaction.user)
                    .setTitle("Rôles automatiques")
                    .setDescription(`Le${req.length > 1 ? 's rôles configurés' : ' rôle configuré'} sur ${interaction.guild.name} ${req.length > 1 ? 'sont':'est'} :\n${req.map(r => `<@&${r.role_id}>`).join(' ')}`)
                    .setColor(interaction.member.displayHexColor)
                
                interaction.editReply({ embeds: [ embed ] }).catch(() => {});
            };
            if (subcommand == 'ajouter') {
                let role = interaction.options.getRole('rôle');
                if (role.position >= interaction.member.roles.highest.position) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("🚫 Rôle trop haut")
                    .setDescription(`Ce rôle est **supérieur** ou **égal** à vous dans la hiérarchie des rôles`)
                    .setColor(role.hexColor)
                ] }).catch(() => {});

                if (req.find(x => x.role_id == role.id)) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôle déjà configuré")
                    .setDescription(`Le rôle <@&${role.id}> est déjà configuré sur ${interaction.guild.name}`)
                    .setColor(role.hexColor)
                ] }).catch(() => {});

                interaction.client.db.query(`INSERT INTO roles_start (guild_id, role_id) VALUES ("${interaction.guild.id}", '${role.id}')`, (er) => {
                    if (er) {
                        functions.sendError(er, 'query add at /autorole ajouter', interaction.user);
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                        return;
                    };

                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Rôle configuré")
                        .setDescription(`Le rôle <@&${role.id}> est maintenant un rôle donné automatiquement aux nouveaux membres`)
                        .setColor(role.hexColor)
                    ] }).catch(() => {});
                });
            };
            if (subcommand == 'retirer') {
                let role = interaction.options.getRole('rôle');
                if (role.position >= interaction.member.roles.highest.position) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("🚫 Rôle trop haut")
                    .setDescription(`Ce rôle est **supérieur** ou **égal** à vous dans la hiérarchie des rôles`)
                    .setColor(role.hexColor)
                ] }).catch(() => {});

                if (!req.find(x => x.role_id == role.id)) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôle non configuré")
                    .setDescription(`Le rôle <@&${role.id}> n'est pas configuré sur ${interaction.guild.name}`)
                    .setColor(role.hexColor)
                ] }).catch(() => {});

                interaction.client.db.query(`DELETE FROM roles_start WHERE guild_id="${interaction.guild.id}" AND role_id="${role.id}"`, (er) => {
                    if (er) {
                        functions.sendError(er, 'query remove at /autorole retirer', interaction.user);
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                        return;
                    };

                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Rôle configuré")
                        .setDescription(`Le rôle <@&${role.id}> n'est maintenant plus un rôle donné automatiquement aux nouveaux membres`)
                        .setColor(role.hexColor)
                    ] }).catch(() => {});
                });
            };
        });
    }
};