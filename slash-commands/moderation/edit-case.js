const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'edit-case',
        description: "Modifie un log de modération sur le serveur",
        options: [
            {
                name: 'numéro',
                description: "Numéro du log",
                required: true,
                autocomplete: false,
                type: 'INTEGER'
            },
            {
                name: 'raison',
                description: "La nouvelle raison du log",
                required: true,
                type: "STRING",
                autocomplete: false
            }
        ]
    },
    help: {
        dm: false,
        dev: false,
        permissions: ['manage_guild'],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const reason = interaction.options.get('raison').value;
        const id = interaction.options.get('numéro').value;

        if (reason.includes('"')) return interaction.reply({ embeds: [ package.embeds.guillement(interaction.user) ], ephemeral: ephemeral });

        interaction.client.db.query(`SELECT * FROM mod_cases WHERE guild_id="${interaction.guild.id}" AND case_id="${id}"`, (err, req) => {
            if (err) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ], ephemeral: ephemeral }) & console.log(e);

            if (req.length === 0) return interaction.reply({ content: "Ce log n'existe pas. Faites `!!modlogs` pour afficher la liste des logs.", ephemeral: ephemeral });
            interaction.client.db.query(`UPDATE mod_cases SET reason="${reason}" WHERE guild_id="${interaction.guild.id}" AND case_id="${id}"`, (e) => {
                if (e) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ], ephemeral: ephemeral }) & console.log(e);

                interaction.reply({ content: `J'ai modifié le log d'id \`${id}\` avec la raison suivante : \`\`\`${reason}\`\`\`` });
            });
        });
    }
}