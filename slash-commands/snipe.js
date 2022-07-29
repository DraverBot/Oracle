const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'snipe',
        description: "Affiche le dernier message supprimé dans le salon",
        options: [
            {
                name: 'numéro',
                description: "Le numéro du snipe",
                required: false,
                autocomplete: false,
                type: 'INTEGER'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Cette commande n'est pas exécutable en privé" });

        const index = interaction.options.get('numéro')?.value || 1;

        if (!interaction.channel.snipes || !interaction.channel.snipes.get(index)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Rien")
            .setDescription(`Je ne vois rien à sniper dans ce salon...`)
            .setColor('ORANGE')
        ] });
        const snipeData = interaction.channel.snipes.get(index);
    
        const snipe = new Discord.MessageEmbed()
            .setTitle("Snipe")
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: false }) })
            .setTimestamp(new Date(parseInt(snipeData.createdTimestamp)).toISOString())
            .setFooter({ text: snipeData.author.username, iconURL: snipeData.author.avatarURL({ dynamic: true }) })
            .setDescription(`Voici le contenu du message : \`\`\`${snipeData.content}\`\`\``)
            .setColor(snipeData.member.roles.highest.hexColor)

        interaction.reply({ embeds: [ snipe ] }).catch(() => {});
    }
}