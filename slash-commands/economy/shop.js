const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        permissions:[],
        systems: [{name: "d'économie", value: 'economy_enable', state: true}],
        dm: false,
        dev: false
    },
    configs: {
        name: 'magasin',
        description: "Utilisez le système de magasin",
        options: [
            {
                name: 'item',
                type: 'SUB_COMMAND_GROUP',
                description: "Ajoute des items au magasin",
                options: [
                    {
                        name: 'ajouter',
                        type: 'SUB_COMMAND',
                        description: "Ajouter un item au magasin",
                        options:[
                            {
                                name: 'nom',
                                description: "Nom de l'item",
                                type: 'STRING',
                                required: true
                            },
                            {
                                name: 'type',
                                description: "Type de l'item",
                                type: 'STRING',
                                required: true,
                                choices: [
                                    {
                                        name: 'Rôle',
                                        value: 'role'
                                    },
                                    {
                                        name: 'Étiquette',
                                        value: 'text'
                                    }
                                ]
                            },
                            {
                                name: 'prix',
                                description: "Prix de l'item",
                                type: 'INTEGER',
                                required: true
                            },
                            {
                                name: 'quantité',
                                description: "Nombre d'items que vous voulez ajouter (laissez vide pour illimité)",
                                type: 'INTEGER',
                                required: false
                            },
                            {
                                name: 'description',
                                description: "Description de l'étiquette (si étiquette)",
                                type: 'STRING',
                                required: false
                            },
                            {
                                name: 'role',
                                description: "Rôle (si l'item est un rôle)",
                                type: 'ROLE',
                                required: false
                            }
                        ]
                    },
                    {
                        name: 'supprimer',
                        description: "Supprime un item du magasin",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: "identifiant",
                                description: "Identifiant de l'item à supprimer",
                                type: 'STRING',
                                required: true
                            }
                        ]
                    }
                ]
            },
            {
                name: 'view',
                description: "Affiche le magasin",
                type: 'SUB_COMMAND'
            },
            {
                name: 'acheter',
                description: "Achète un item du shop",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'identifiant',
                        type: 'STRING',
                        description: "Identifiant de l'item à acheter",
                        required: true
                    }
                ]
            }
        ]
    }
}