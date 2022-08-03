const Discord = require('discord.js');
const functions = require('../assets/functions.js');
const package = functions.package();

module.exports = {
    configs: {
        name: "pof",
        description: "Fait un pile ou face",
        options: [
            {
                name: "pari",
                description: "Le choix du côté de la pièce",
                type: "STRING",
                required: true,
                choices: [
                    {
                        name:"Pile",
                        value: "pile"
                    },
                    {
                        name: "Face",
                        value: "face"
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        const faces = ["pile", "face"];
        let pari = faces[interaction.options.get("pari").value];

        await interaction.reply({ content: "Lancement de la pièce !" });
        setTimeout(() => {
            const face = faces[functions.random(0, 2)];

            interaction.editReply({ content: `Et c'est **${face}** ! Vous avez **${face == pari ? "gagné" : "perdu"}** votre pari.` });
        }, 1000);
    }
};