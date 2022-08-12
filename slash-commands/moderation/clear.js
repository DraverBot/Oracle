const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        permissions: ['manage_messages'],
        cd: 5,
        dm: false,
        dev: false,
        systems: []
    },
    configs: {
        name: 'clear',
        description: "Supprime un nombre de messages dans le salon",
        options: [
            {
                name: 'messages',
                description: "Nombre de messages à supprimer",
                required: true,
                type: 'INTEGER'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let number = parseInt(interaction.options.get('messages').value);
        if (number < 1 || number > 100) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("🚫 Nombre invalide")
            .setDescription(`Merci de saisir un nombre entre **1** et **100**`)
            .setColor('#ff0000')
        ] }).catch(() => {});

        await interaction.channel.bulkDelete(number).catch(() => {});
        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("✅ Messages supprimés")
            .setDescription(`**${number}** message${number > 1 ? 's a été supprimé':' ont été supprimés'}.`)
            .setColor('#00ff00')
        ] }).catch(() => {});
    }
}