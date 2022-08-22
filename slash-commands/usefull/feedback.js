const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'avis',
        description: "Envoie votre avis sur le bot",
        options: [
            {
                name: 'avis',
                description: "Votre avis",
                type: 'STRING',
                required: true,
                autocomplete: false
            }
        ]
    },
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const avis = interaction.options.get('avis').value;
        const embed = package.embeds.classic(interaction.user)
            .setTitle("Avis")
            .setDescription(`${interaction.user.username} ( ${interaction.user.id} ) vient de donner son avis sur Oracle :\n\`\`\`${avis}\`\`\``)
            .setColor('ORANGE')
        
        interaction.client.channels.cache.get('946079273335279676').send({ embeds: [ embed ] }).catch(() => {});
        interaction.reply({ content: `Vous avez donné votre avis sur Oracle`, ephemeral: true, components: [ new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Donner un avis sur top.gg', style: 'LINK', url: package.configs.topgg }))
        ] }).catch(() => {});
    }
}