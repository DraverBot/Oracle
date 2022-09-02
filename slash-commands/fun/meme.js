const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const axios = require('axios');

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: true,
        systems: [],
        permissions: []
    },
    configs: {
        name: 'meme',
        description: "Envoie un meme"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        await interaction.deferReply();

        axios('https://some-random-api.ml/meme').then((res) => {
            if (res.statusText !== 'OK') return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Erreur")
                .setDescription(`Je n'ai pas pu récupérer de meme.\nSi ce message se réaffiche, contactez mes développeurs (\`/contact\`)`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Meme")
                .setColor(interaction?.guild?.me?.displayHexColor ?? 'ORANGE')
                .setDescription(res.data.caption)
                .setImage(res.data.image)
            ] }).catch(() => {});
        });
    }
}