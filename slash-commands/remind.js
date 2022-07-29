const Discord = require('discord.js');
const ms = require('ms');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: "rappel",
        description: "Gère vos rappels",
        options: [
            {
                name: "ajouter",
                description: "Ajoute un rappel",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "temps",
                        description: "Le temps avant le rappel",
                        type: "STRING",
                        required: true,
                    },
                    {
                        name: "contenu",
                        description: "Contenu du rappel",
                        required: true,
                        type: "STRING"
                    }
                ]
            },
            {
                name: "retirer",
                description: "Retire un rappel",
                type: "SUB_COMMAND",
                options: [
                    {
                        name: "numéro",
                        description: "Numéro du rappel à supprimer",
                        type: "NUMBER",
                        required: true
                    }
                ]
            },
            {
                name: "liste",
                type: "SUB_COMMAND",
                description: "Affiche la liste de vos rappels"
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    run: (interaction) => {
        return interaction.reply({ embeds: [ new Discord.MessageEmbed({ title: 'Commande en développement', color: 'YELLOW' }) ] }).catch(() => {});

        const sub = interaction.options.getSubcommand();
        const manager = interaction.client.RemindsManager;

        if (sub === "ajouter") {
            let time = interaction.options.get('temps').value;
            if (!ms(time)) return interaction.reply({ embeds: [ package.embeds.invalidTime(interaction.user) ] });
            
            const remind = interaction.options.get('contenu').value;
            manager.createInteraction(interaction.user, interaction, ms(time), remind);
        }
    }
}