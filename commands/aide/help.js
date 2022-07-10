const Discord = require('discord.js');
const emojis = require('../../assets/data/emojis.json');

module.exports = {
    help: {
        name: "help",
        description: "Commande affichant toutes les autres commandes",
        aliases: ['aide'],
        permissions: [],
        cooldown: 5,
        private: false,
        dm: true,
    },
    /**
     * @param {Discord.Message} message 
     * @param {Discord.Client} client 
     */
    run: (message, args, client, prefix) => {
        var reacts = [];
        var correspondance = [
            {name: "Aide", emoji: '🧰', value: 'aide'},
            {name: "Modération", emoji: "🛠", value: 'moderation'},
            {name: 'Divers', emoji: '🎈', value: 'misc'},
            {name: 'giveaways', emoji: "🎉", value: 'giveaways'},
            {name: 'Rôles à réactions', emoji: '➕', value: 'rolereacts'},
            {name: 'Mail', emoji: '📩', value: 'mails'}
        ];

        correspondance.push({value: 'close', name: "Fermer", emoji: '❌'});

        correspondance.forEach((x) => {
            reacts.push(x);
        });

        const menu = new Discord.MessageEmbed()
            .setTitle("Aide")
            .setTimestamp()
            .setColor("DARK_PURPLE")
            .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL()})
            .setDescription(`Appuyez sur les bouttons pour accéder à la page d'aide correspondante`);

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

        let first = new Discord.MessageActionRow()
        let second = new Discord.MessageActionRow()

        for (let i = 0; i<correspondance.length;i++) {
            const btn = new Discord.MessageButton()
                .setCustomId(correspondance[i].value)
                .setEmoji(correspondance[i].emoji)
                .setLabel(correspondance[i].name)

            if (correspondance[i].value === 'close') {
                btn.setStyle('DANGER');
            } else {
                btn.setStyle('PRIMARY');
            }

            if (i <= 4) {
                first.addComponents(btn);
            } else {
                second.addComponents(btn);
            };
        }

        message.channel.send({ embeds:[menu], components: [ first, second ]}).then((msg) => {
            const collector = msg.createMessageComponentCollector({ filter: x => x.user.id === message.author.id, time: 120000});

            collector.on('collect', (interaction) => {
                interaction.reply({ content: "Commande reçue" }).then(() => {
                    interaction.deleteReply();
                });

                const value = correspondance.find((x) => x.value === interaction.customId).value;
                const commands = require('../../assets/data/commands.json');
                
                if (value === 'close') {
                    if (msg.deletable) msg.delete().catch(() => {}) & message.delete().catch(() => {});
                    message.channel.send({content: `${emojis.gsyes} J'ai fermé le menu.`})
                    return collector.stop('end');
                };

                const commandsArray = commands[value];
                let text = "";

                commandsArray.forEach((command) => {
                    if (command.help.appear !== undefined && command.help.appear === false) return;
                    
                    text += `[\`${prefix}${command.name}\`](https://github.com/Greensky-gs/gs-bot-doc/blob/main/commands/${command.name}.md) : ${command.help.description}\n`;
                });
                const newEmbed = new Discord.MessageEmbed()
                    .setTitle("Aide")
                    .setColor('DARK_PURPLE')
                    .setTimestamp()
                    .setAuthor({ name: message.author.username, iconURL: message.author.avatarURL({dynamic: true})})
                    .setDescription(text);

                if (msg.editable) {
                    msg.edit({embeds: [ newEmbed ]}).catch((x) => {console.log(x)});
                }
            });

            collector.on('end', () => {
                msg.delete().catch(() => {});
            });
        });

    }
};