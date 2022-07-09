const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'contact',
        description: "Prend contact avec mon développeur",
        options: [
            {
                name: 'bug',
                description: "Le bug à signaler",
                type: 'STRING',
                required: true,
                autocomplete: false
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const bug = interaction.options.get('bug').value;
        const embed = package.embeds.classic(interaction.user)
            .setTitle("Erreur")
            .setDescription(`${interaction.user.username} ( ${interaction.user.id} ) a trouvé un bug sur le greensky bot :\n\`\`\`${bug}\`\`\``)
            .setColor('ORANGE')
        
        interaction.client.channels.cache.get('954998495977291807').send({ embeds: [ embed ] });
        interaction.reply({ content: `J'ai signalé ce bug à mon développeur.` });
    }
}