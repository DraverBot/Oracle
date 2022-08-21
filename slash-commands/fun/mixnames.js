const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: true
    },
    configs: {
        name: 'mixnames',
        description: "Fait le mélange de deux pseudos",
        options: [
            {
                name: "utilisateur1",
                description: "Premier utilisateur",
                type: 'USER',
                required: true
            },
            {
                name: 'utilisateur2',
                description: "Deuxième utilisateur",
                type: 'USER',
                required: false
            },
            {
                name: "texte",
                description: "Texte à la place du deuxième utilisateur",
                type: 'STRING',
                required: false
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let first = interaction.options.getUser('utilisateur1').username;
        let second = interaction.options.getUser('utilisateur2')?.username ?? interaction.options.get('texte')?.value ?? interaction.client.user.username;

        let mixed = "";
        let firstPart = first.substring(0, (first.length / 2).toFixed(0));
        let secondPart = second.substring((second.length / 2).toFixed(0));

        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Mix")
            .setDescription(`Le mix de ${first} et de ${second} est \`${firstPart + secondPart}\``)
            .setColor(interaction?.member?.displayHexColor ?? interaction?.guild?.me?.displayHexColor ?? 'ORANGE')
        ] }).catch(() => {});
    }
}