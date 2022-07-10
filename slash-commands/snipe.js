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

        const index = interaction.options.get('numéro') ? interaction.options.get('numéro').value : 1;

        interaction.client.db.query(`SELECT * FROM snipes WHERE guild_id="${interaction.guild.id}" AND channel_id="${interaction.channel.id}" ODER BY date DESC`, (err, req) => {
            if (err) {
                console.log(err);
                interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] });
                return;
            };

            const number = index-1;
            if (req.length === 0 || number + 1 > req.length) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Rien")
                .setDescription(`Je ne vois rien à sniper dans ce salon...`)
                .setColor('ORANGE')
            ] });
    
            const data = req[number];
            const author = interaction.guild.members.cache.get(data.user_id) || interaction.guild.me;
     
            const snipe = new Discord.MessageEmbed()
                .setTitle("Snipe")
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: false }) })
                .setTimestamp(new Date(parseInt(data.date)).toISOString())
                .setFooter({ text: author.user.username, iconURL: author.user.avatarURL({ dynamic: true }) })
                .setDescription(`Voici le contenu du message : \`\`\`${data.content}\`\`\``)
                .setColor(author.roles.highest.hexColor)
    
            interaction.reply({ embeds: [ snipe ] });
        })
    }
}