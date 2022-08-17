const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const perms = Object.keys(package.perms).filter(x => x!== "USE_VAD").sort().map(x => ({ name: package.perms[x], value: x }));

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
            },
            {
                name: "identifier",
                description: "Affiche l'identifiant d'un rôle",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "rôle",
                        description: "Rôle à identifier",
                        type: 'CHANNEL',
                        required: true
                    },
                    {
                        name: 'embed',
                        description: "Affiche la réponse sous forme d'embed (plus compliqué pour copier/coller)",
                        required: false,
                        type: 'BOOLEAN'
                    }
                ]
            },
            {
                name: 'permissions',
                description: "Gère les permissions d'un rôle",
                type: 'SUB_COMMAND_GROUP',
                options: [
                    {
                        name: "accorder",
                        description: "Accorde une permission à un rôle",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: "rôle",
                                description: "Rôle à gérer",
                                type: 'ROLE',
                                required: true
                            },
                            {
                                name: 'permission',
                                description: "Permission à accorder",
                                required: true,
                                type: 'STRING',
                            }
                        ]
                    },
                    {
                        name: 'refuser',
                        description: "Refuse une permission à un rôle",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: "rôle",
                                description: "Rôle à gérer",
                                required: true,
                                type: 'ROLE'
                            },
                            {
                                name: "permission",
                                description: 'Permission à refuser',
                                type: 'STRING',
                                required: true
                            }
                        ]
                    },
                    {
                        name: "liste",
                        description: "Affiche la liste des permissions accordables",
                        type: 'SUB_COMMAND'
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

        if (['accorder', 'refuser'].includes(subCommand)) {
            let role = interaction.options.getRole('rôle');
            let permissionString = interaction.options.get('permission').value;
            const perm = perms.find(x => x.name.toLowerCase() == permissionString.toLowerCase());
            if (!perm) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Permission inconnue")
                .setDescription(`Cette permission n'existe pas.\nUtilisez la commande \`/role permissions liste\` pour voir la liste des permissions disponibles`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            if (role.position >= interaction.member.roles.highest.position) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Action impossible")
                .setDescription(`Le rôle <@&${role.id}> est trop haut pour vous`)
                .setColor('#ff0000')
            ] }).catch(() => {});
            if (role.position >= interaction.guild.me.roles.highest.position) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Action impossible")
                .setDescription(`Le rôle <@&${role.id}> est trop haut pour moi`)
                .setColor('#ff0000')
            ] }).catch(() => {});
            if (!interaction.member.permissions.has(perm.value)) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, perm.value) ] }).catch(() => {});
            if (!interaction.guild.me.permissions.has(perm.value)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("❌ Permission manquante")
                .setDescription(`Je n'ai pas la permission **${perm.name}**`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            let permissions = role.permissions.toArray();
            if (subCommand == 'accorder') {
                if (!permissions.includes(perm.value)) permissions.push(perm.value);
            } else {
                if (permissions.includes(perm.value)) {
                    permissions.splice(permissions.indexOf(perm.value), 1);
                };
            };

            role.setPermissions(Discord.Permissions.resolve(permissions));
            
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle(subCommand == 'accorder' ? "✅ Permission accordée":"🚫 Permission refusée")
                .setColor(subCommand == 'accorder' ? '#00ff00' : '#ff0000')
                .setDescription(`La permission \`${perm.name}\` a été **${subCommand == 'accorder' ? "accordée":'refusée'}** au rôle <@&${role.id}>`)
            ] }).catch(() => {});
        };
        if (subCommand == 'liste') {
            const embed = package.embeds.classic(interaction.user)
                .setTitle("Permissions accordables")
                .setDescription(`Voici la liste des permissions accordables pour un rôle :\n${perms.map(x => x.name).map(x => `\`${x}\``).join(', ')}`)
                .setColor(interaction.guild.me.displayHexColor)
            
            interaction.reply({ embeds: [ embed ] }).catch(() => {});
        }
        if (subCommand == 'identifier') {
            let { id, hexColor } = interaction.options.getRole('rôle');
            let embed = interaction.options.getBoolean('embed') ?? false;

            let reply = {};
            if (embed == true) {
                reply.embeds = [ package.embeds.classic(interaction.user)
                    .setTitle("Identifiant")
                    .setDescription(`L'identifiant du rôle <@&${id}> est \`${id}\``)
                    .setColor(hexColor)
                ];
            } else {
                reply.content = `\`${id}\``;
            };

            interaction.reply(reply).catch(() => {});
        }
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