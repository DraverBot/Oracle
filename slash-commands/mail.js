const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'mail',
        description: "Envoie un mail à un utilisateur",
        options: [
            {
                name: 'utilisateur',
                required: true,
                type: 'USER',
                description: "Utilisateur qui recevra le mail"
            },
            {
                name: 'objet',
                description: "Objet du mail",
                required: true,
                type: 'STRING'
            },
            {
                name: 'contenu',
                description: "Contenu du mail",
                type: 'STRING',
                required: true
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let user = interaction.options.get('utilisateur').user;
        let objet = interaction.options.get('objet').value;
        let content = interaction.options.get('contenu').value;

        if ([objet, content].some(x => x.includes('"'))) return interaction.reply({ embeds: [ package.embeds.guillement(interaction.user) ] });

        interaction.client.mailManager.send(user, interaction.channel, content, objet, interaction.user, false);
        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Mail envoyé")
            .setDescription(`J'ai envoyé votre mail à <@${user.id}>`)
            .setColor('ORANGE')
        ], ephemeral: true }).catch(() => {});
    }
}