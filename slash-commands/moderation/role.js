const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'role',
        description: "Gère les rôles",
        options: [
            {
                name: 'créer',
                description: "Créer un rôle",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: 'nom',
                        description: "Nom du rôle",
                        required: true,
                        autocomplete: false,
                        type: 'STRING'
                    }
                ]
            },
            {
                name: 'delete',
                description: "Supprime un rôle",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'role',
                        required: true,
                        autocomplete: false,
                        type: 'ROLE',
                        description: "Le rôle à supprimer"
                    }
                ]
            },
            {
                name: 'add',
                description: "Ajoute un rôle à un membre",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'utilisateur',
                        description: "L'utilisateur qui aura le rôle.",
                        required: true,
                        autocomplete: false,
                        type: 'USER'
                    },
                    {
                        name: 'role',
                        description: "Le rôle à ajouter",
                        required: true,
                        autocomplete: false,
                        type: 'ROLE'
                    }
                ]
            },
            {
                name: 'remove',
                description: "Retire un rôle à un membre",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'utilisateur',
                        description: "Utilisateur qui perdra le rôle",
                        required: true,
                        autocomplete: false,
                        type: 'USER'
                    },
                    {
                        name: 'role',
                        description: "Le rôle à retirer",
                        required: true,
                        autocomplete: false,
                        type: 'ROLE'
                    }
                ]
            },
            {
                name: 'renommer',
                description: "Renomme un rôle",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'rôle',
                        description: "Rôle à renommer",
                        required: true,
                        type: 'ROLE'
                    },
                    {
                        name: 'nom',
                        description: "Nom du rôle",
                        required: true,
                        type: 'STRING'
                    }
                ]
            },
            {
                name: 'déplacer',
                description: "Déplace un rôle",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'rôle',
                        description: "Rôle à déplacer",
                        required: true,
                        type: 'ROLE'
                    },
                    {
                        name: 'places',
                        description: "Nombre de places pour déplacer le rôle. Rentrez un nombre négatif ou un nombre positif.",
                        required: true,
                        type: 'INTEGER'
                    }
                ]
            },
            {
                name: 'coloriser',
                description: "Colorise un rôle",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'rôle',
                        description: "Rôle à coloriser",
                        type: 'ROLE',
                        required: true
                    },
                    {
                        name: 'couleur',
                        description: "Couleur à mettre sur le rôle. Donnez la en hexadecimal (ex: #ff0000)",
                        type: 'STRING',
                        required: true
                    }
                ]
            }
        ]
    },
    help: {
        dm: false,
        dev: false,
        permissions: ['manage_roles'],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const subCommand = interaction.options.getSubcommand();

        const check = (role, member) => {
            if (role.position >= interaction.guild.me.roles.highest.position) {
                interaction.reply({ content: "Ce rôle est trop haut pour moi" });
                return false;
            };
            if (role.position >= interaction.member.roles.highest.position)  {
                interaction.reply({ content: "Ce rôle est trop haut pour vous" });
                return false;
            };
            if (member && member.roles.highest.position >= interaction.guild.me.roles.highest.position) {
                interaction.reply({ content: "Cet utilisateur est supérieur ou égal à moi dans la hiérachie des rôles" });
                return false;
            };
            if (member && interaction.member.roles.highest.position <= member.roles.highest.position) {
                interaction.reply({ content: "Cet utilisateur est supérieur ou égal à vous dans la hiérarchie des rôles" });
                return false;
            };
            return true;
        };

        if (subCommand === 'créer') {
            const roleName = interaction.options.get('nom').value;
            
            interaction.guild.roles.create({
                name: roleName
            }).then((role) => {
                interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôle crée")
                    .setDescription(`Le rôle <@&${role.id}> a été crée`)
                    .setColor(role.hexColor)
                ] });
            }).catch(() => {});
        };
        if (subCommand === 'delete') {
            const role = interaction.options.get('role').role;

            if (role.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "Ce rôle est supérieur ou égal à vous dans la hiérarchie des rôles." });
            if (role.position >= interaction.guild.me.roles.highest.position) return interaction.reply({ content: "Ce rôles est supérieur ou égal à moi dans la hiérarchie des rôles." });

            role.delete().then(() => {
                interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôle supprimé")
                    .setDescription(`Le rôle ${role.name} a été supprimé`)
                    .setColor(role.hexColor)
                ] });
            }).catch(() => {});
        };
        if (subCommand === 'add') {
            const member = interaction.options.get('utilisateur').member;
            const role = interaction.options.get('role').role;

            if (!check(role, member)) return;
            member.roles.add(role).then(() => {
                interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôle ajouté")
                    .setDescription(`Le rôle <@&${role.id}> a été ajouté à <@${member.id}>`)
                    .setColor(role.hexColor)
                ] })
            }).catch(() => {});
        };
        if (subCommand === 'remove') {
            const member = interaction.options.get('utilisateur').member;
            const role = interaction.options.get('role').role;

            if (!check(role, member)) return;
            member.roles.remove(role).then(() => {
                interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Rôle retiré")
                    .setDescription(`Le rôle <@&${role.id}> a été retiré à <@${member.id}>`)
                    .setColor(role.hexColor)
                ] })
            }).catch(() => {});
        };
        if (subCommand == 'renommer') {
            let role = interaction.options.getRole('rôle');
            let nom = interaction.options.getString('nom');

            if (!check(role)) return;

            let oldName = role.name;
            role.setName(nom);

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Rôle renommé")
                .setDescription(`Le rôle ${oldName} a été renommé en <@&${role.id}>`)
                .setColor(role.hexColor)
            ] });
        };
        if (subCommand == 'déplacer') {
            let places = interaction.options.getInteger('places');
            let role = interaction.options.getRole('rôle');
            
            if (!check(role)) return;
            let roles = interaction.guild.roles.cache.size;

            let position = role.position + places;

            if (position < 1) position = 1;
            if (position > roles) position = roles;

            if (position > interaction.guild.me.roles.highest.position) return interaction.options.reply({ content: `La nouvelle place de ce rôle est trop haute pour moi.` }).catch(() => {});
            if (position > interaction.member.roles.highest.position) return interaction.options.reply({ content: `La nouvelle place de ce rôle est trop haute pour vous.` }).catch(() => {});

            role.setPosition(position);

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Rôle déplacé")
                .setDescription(`Le rôle <@&${role.id}> a été déplacé vers le **${places > 0 ? 'haut' : 'bas'}**`)
                .setColor(role.hexColor)
            ] })
        };
        if (subCommand == 'coloriser') {
            let color = interaction.options.getString('couleur');
            let role = interaction.options.getRole('rôle');

            if (!check(role)) return;
            const reg = /^#[0-9A-F]{6}$/i;
            if (!reg.test(color)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Couleur invalide")
                .setDescription(`Vous avez saisi une couleur invalide.\nUtilisez le code hexadécimal.\nExemple :\n> \`#AA19EE\``)
                .setColor('#ff0000')
            ] });

            role.setColor(color);
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Rôle colorisé")
                .setDescription(`La couleur du rôle <@&${role.id}> a été changée en ${color.startsWith('#') ? '':'#'}${color}`)
                .setColor(role.hexColor)
            ] });
        }
    }
}