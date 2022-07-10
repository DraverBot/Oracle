const Discord = require('discord.js');
const { sendError } = require('../assets/functions');
const API = require('../assets/tickets');
const commands = require('../assets/data/slashCommands');
const embeds = require('../assets/embeds');

module.exports = {
    event: 'interactionCreate',
    /**
     * @param {Discord.Interaction} interaction 
     */
    execute: (interaction) => {
        if (interaction.isCommand()) {
            let cmd = commands.get(interaction.commandName);
            if (!cmd) return interaction.reply({ embeds: [ embeds.classic(interaction.user)
                .setTitle("Erreur")
                .setDescription(`Je n'ai pas trouvé cette commande parmi mes commandes.\nVeuillez patienter un peu.\n\n:bulb:\n> Si l'erreur persiste, contactez [mes développeurs](${require('../assets/data/data.json').support})`)
                .setColor('ORANGE')
            ], ephemeral: true });

            const run = new Promise((resolve) => resolve(cmd.run(interaction)));
            run.catch((error) => {
                console.log(error);
                sendError(error, interaction.commandName, interaction.user);

                if (!interaction.replied) interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande` })
                else interaction.editReply({ content: `Une erreur s'est produite lors de l'exécution de la commande`, embeds: [], components: [] });
            })
        } else if (interaction.isButton()) {
            if (!interaction.guild) return;

            interaction.client.db.query(`SELECT * FROM tickets WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                if (err) {
                    interaction.reply({ content: "Une erreur a eu lieu lors de l'ouverture du ticket", ephemeral: true });
                    console.log(err);
                    return;
                };

                if (req.length === 0) return;

                const guild = interaction.guild;

                const data = req.find((x) => x.message_id === interaction.message.id);

                if (interaction.customId === 'ticket-create') {
                    if (!data.type === 'panel') return;
    
                    API.create(interaction.guild, interaction.user, data.subject);
                    interaction.reply({ content: "Je crée votre ticket.", ephemeral: true });
                };
                if (interaction.customId === 'reopen-ticket') {
                    if (!data.type === 'panel-closed-ticket') return;
                    
                    const object = req.find((x) => x.channel_id === interaction.channel.id && x.type === "ticket-message");
                    if (!object) return;
    
                    const member = guild.members.cache.get(object.user_id);
                    if (!member) return;
    
                    API.reopen(interaction.channel, member.user);
                    interaction.reply({ content: "Je réouvre votre ticket", ephemeral: true });
                };
                if (interaction.customId === 'delete-ticket') {
                    if (!data.type === 'panel-closed-ticket') return;
                    
                    API.delete(interaction.channel, interaction.user);
                    interaction.reply({ content: "Je supprime votre ticket", ephemeral: true });
                };
                if (interaction.customId === 'confirm-close-ticket') {
                    if (!data.type === 'close-ticket-panel') return;
                    
                    const object = req.find((x) => x.channel_id === interaction.channel.id && x.type === 'ticket-message');
                    if (!object) return;
    
                    const member = guild.members.cache.get(object.user_id);
                    if (!member) return;
    
                    API.close_ticket(guild, interaction.channel, member.user);
                    interaction.reply({ content: "Je ferme le ticket :white_check_mark:", ephemeral: true });
                };
                if (interaction.customId === 'close-ticket') {
                    if (!data.type === 'ticket-message') return;

                    API.close_ticket_panel(guild, interaction.channel, interaction.user);
                    interaction.reply({ content: "Voulez-vous fermer le ticket ?", ephemeral: true });
                };
                if (interaction.customId === 'save-ticket') {
                    if (!data.type === 'panel-closed-ticket') return;
                    
                    API.save_transcript(interaction.channel, interaction.user);
                    interaction.reply({ content: "Je sauvegarde la conversation", ephemeral: true });
                };
                if (interaction.customId === 'cancel-close-ticket') {
                    if (!data.type === 'close-ticket-panel') return;
                    
                    interaction.message.delete().catch(() => {});
                    
                    interaction.client.db.query(`DELETE FROM tickets WHERE message_id="${data.message_id}"`, (err, req) => {
                        if (err) console.log(err);
                    });
                    interaction.reply({ content: "Je supprime le ticket." });
                }
            });
        }
    }
};