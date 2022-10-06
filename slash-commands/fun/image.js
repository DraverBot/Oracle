const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const axios = require('axios');

const types = [
    {
        name: 'Chien',
        value: 'dog'
    },
    {
        name: 'Chat',
        value: 'cat'
    },
    {
        name: 'Panda',
        value: 'panda'
    },
    {
        name: 'Panda rouge',
        value: 'red_panda'
    },
    {
        name: 'Oiseau',
        value: 'bird'
    },
    {
        name: 'Renard',
        value: 'fox'
    },
    {
        name: 'Koala',
        value: 'koala'
    }
]

module.exports = {
    help: {
        cd: 5,
        dm: true,
        dev: false,
        permissions: [],
        systems: []
    },
    configs: {
        name: 'image',
        description: "Affiche une image",
        options: [
            {
                name: 'image',
                type: 'STRING',
                required: true,
                description: "Image que vous voulez voir",
                choices: types.concat({ name: 'Aléatoire', value: 'random' })
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        await interaction.deferReply();
        const img = interaction.options.getString('image');
        const endpoint = img === 'random' ? types[functions.random(types.length, 0)].value : img;

        const url = `https://some-random-api.ml/img/${endpoint}`;
        axios(url).then((res) => {
            if (res.data.link) {
                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle(types.find(x => x.value === endpoint).name)
                    .setImage(res.data.link)
                    .setColor('ORANGE')
                ] }).catch(() => {});
            } else {
                return interaction.editReply({ content: 'Une erreur est survenue.' }).catch(() => {});
            }
        })
    }
}