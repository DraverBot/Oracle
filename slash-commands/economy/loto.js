const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dm: false,
        dev: false,
        systems: [{name: "d'économie", value: "economy_enable", state: true}],
        permissions: []
    },
    configs: {
        name: "loto",
        description: "Gère un loto sur le serveur",
        options: [
            {
                name: 'gérer',
                description: "Gère le loto",
                type: "SUB_COMMAND_GROUP",
                options: [
                    {
                        name: "démarrer",
                        description: "Lance le loto sur le serveur",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: "récompense",
                                description: `Récompense en ${package.configs.coins} du loto`,
                                type: 'INTEGER',
                                required: true
                            },
                            {
                                name: 'gagnants',
                                description: "Nombre de numéro gagnants à tirer (minimum 5)",
                                type: 'INTEGER',
                                required: true
                            },
                            {
                                name: "complémentaires",
                                description: "Nombre de numéro complémentaires à tirer (minimum 2)",
                                type: 'INTEGER',
                                required: true
                            },
                            {
                                name: "temps",
                                description: "Temps avant la fin du loto (ex: 1d)",
                                type: 'STRING',
                                required: true
                            }
                        ]
                    },
                    {
                        name: "tirage",
                        description: "Fait le tirage du loto",
                        type: 'SUB_COMMAND'
                    }
                ]
            },
            {
                name: 'participer',
                description: "Participez au loto en cours",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "gagnants",
                        description: "Les numéro gagnants que vous jouez (ex: 15 68 46 75 12)",
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: "complémentaires",
                        description: "Les numéro complémentaires que vous jouez (ex: 94 60)",
                        required: true,
                        type: 'STRING'
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        
    }
};