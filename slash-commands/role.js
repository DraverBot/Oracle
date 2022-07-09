const Discord = require('discord.js');
const functions = require('../assets/functions');
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
            }
        ]
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
            if (member.roles.highest.position >= interaction.guild.me.roles.highest.position) {
                interaction.reply({ content: "Cet utilisateur est supérieur ou égal à moi dans la hiérachie des rôles" });
                return false;
            };
            if (interaction.member.roles.highest.position <= member.roles.highest.position) {
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
                interaction.reply({ content: "Rôle crée" });
            }).catch(() => {});
        };
        if (subCommand === 'delete') {
            const role = interaction.options.get('role').role;

            if (role.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "Ce rôle est supérieur ou égal à vous dans la hiérarchie des rôles." });
            if (role.position >= interaction.guild.me.roles.highest.position) return interaction.reply({ content: "Ce rôles est supérieur ou égal à moi dans la hiérarchie des rôles." });

            role.delete().then(() => {
                interaction.reply({ content: "Rôle supprimé" });
            }).catch(() => {});
        };
        if (subCommand === 'add') {
            const member = interaction.options.get('user').member;
            const role = interaction.options.get('role').role;

            if (!check(role, member)) return;
            member.roles.add(role).then(() => {
                interaction.reply({ content: "Rôle ajouté" });
            }).catch(() => {});
        };
        if (subCommand === 'remove') {
            const member = interaction.options.get('user').member;
            const role = interaction.options.get('role').role;

            if (!check(role, member)) return;
            member.roles.remove(role).then(() => {
                interaction.reply({ content: "Rôle retiré" });
            }).catch(() => {});
        }
    }
}