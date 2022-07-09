const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'help',
        description: "Affiche la page d'aide des commandes",
        options: [
            {
                name: 'discret',
                description: "Fait en sorte que vous seul voyez ce message.",
                type: 'BOOLEAN',
                required: false,
                autocomplete: false
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let ephemeral = interaction.options.get('discret') ? interaction.options.get('discret').value : false;

        var correspondance = [
            {name: "Aide", emoji: '🧰', value: 'aide', description: "Commandes d'aide"},
            {name: "Modération", emoji: "🛠", value: 'moderation', description: "Commandes de modération"},
            {name: 'Divers', emoji: '🎈', value: 'misc', description: "Commandes diverses"},
            {name: 'Giveaways', emoji: '🎉', value: 'giveawyas', description: "Commandes de giveaway"},
            {name: 'Rôles à réaction', emoji: '➕', value: 'rolereacts', description: "Commandes de rôles à réaction"},
            {name: 'Mails', emoji: '📩', value: 'mails', description: "Commandes de mail"}
        ];

        correspondance.push({value: 'close', name: "Fermer", emoji: '❌', description: "Ferme le menu"});


        const menu = new Discord.MessageEmbed()
            .setTitle("Aide")
            .setTimestamp()
            .setColor("DARK_PURPLE")
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(`Appuyez sur les réactions pour accéder à la page d'aide correspondante`);

        const field = (n, v, i) => {
            menu.addField(n, v, i);
        }
        const empty = () => {
            field('** **', '** **', false);
        };

        let i = 0;
        correspondance.forEach((x) => {
            if (i < 2) {
                field(x.name, x.emoji, true);
                i++;
            } else {
                empty();
                field(x.name, x.emoji, true);
                i=0;
            };
        });

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageSelectMenu()
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setPlaceholder("Veuillez choisir une option")
                    .setCustomId('selector')
                    .setOptions(correspondance.map((x) => ( { emoji: x.emoji, label: x.name, value: x.value, description: x.description } )))
            )

        interaction.reply({ embeds: [ menu ], ephemeral: ephemeral, components: [ row ] });

        interaction.fetchReply().then(/** *@param {Discord.Message} */ (msg) => {
            const collector = msg.createMessageComponentCollector({ filter: x => x.user.id === interaction.user.id, time: 120000 });

            collector.on('collect', (interact) => {
                const value = interact.values[0];
                
                if (value === 'close') {
                    collector.stop('close');
                    interaction.editReply({ content: "Vous avez fermé le menu d'aide", ephemeral: ephemeral, embeds: [], components: [] }).catch(console.log)
                    interact.deferUpdate();
                    return;
                };

                const commands = require('../assets/data/commands.json');
                const commandsArray = commands[value];
                let text = "";

                commandsArray.forEach((command) => {
                    if (command.help.appear !== undefined && command.help.appear === false) return;
                    
                    let prop = `\`${command.name}\` : ${command.help.description}\n`
                    text = text + prop;
                });
                const newEmbed = new Discord.MessageEmbed()
                    .setTitle("Aide")
                    .setColor('DARK_PURPLE')
                    .setTimestamp()
                    .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({dynamic: true})})
                    .setDescription(text);

                interaction.editReply({ embeds: [ newEmbed ], ephemeral: ephemeral });
                interact.deferUpdate();
            });
        });
    }
}