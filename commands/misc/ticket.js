const Discord = require('discord.js');
const functions = require('../../assets/functions.js');
const package = functions.package();

module.exports.help = {
    name: 'ticket',
    description: "Interagir avec le système de ticket. Utilisez \`help\` en argument pour avoir l'aide.",
    private: false,
    dm: false,
    aliases: [],
    permissions: [],
    cooldown: 5
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix 
 */
module.exports.run = async(message, args, client, prefix) => {
    const subcommand = (args.shift() || 'help' ).toLowerCase();
    message.delete().catch(() => {});
    const tickets = client.TicketsManager;

    if (subcommand == 'create') {
        let sujet = args.join(' ');
        if (!sujet) return functions.reply(message, package.embeds.noText(message.author));
        tickets.createTicket({ guild: message.guild, user: message.author, sujet });
        
        return functions.reply(message, package.embeds.classic(message.author)
            .setTitle("Ticket crée")
            .setDescription(`Je crée votre ticket`)
            .setColor('ORANGE')
        );
    };

    const checkIfTicket = (needTicket) => {
        if (!tickets.isTicket(message.channel.id)) {
            if (needTicket == true) {
                functions.reply(package.embeds.classic(message.author)
                    .setTitle("Ticket inexistant")
                    .setDescription(`Ce salon n'est pas un ticket.\nCette commande n'est exécutable que dans un ticket.`)
                    .setColor('#ff0000')
                )
                return false;
            };
            return true;
        };
        return true;
    };

    if (subcommand == 'close') {
        if (!checkIfTicket(true)) return;

        tickets.closeTicket({ channel: message.channel });
        return functions.reply(message, package.embeds.classic(message.author)
            .setTitle("Ticket fermé")
            .setDescription(`<@${message.author.id}> a fermé son ticket`)
            .setColor(message.guild.me.displayHexColor)
        ).catch(() => {});
    };
    if (subcommand == 'delete') {
        if (!checkIfTicket(true)) return;

        const msg = await message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setTitle("Suppression")
            .setDescription(`Le ticket sera supprimé <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>`)
            .setColor(message.guild.me.displayHexColor)
        ], components: [ new Discord.MessageActionRow().addComponents(new Discord.MessageButton({ label: 'Annuler', style: 'DANGER', customId: 'cancel' })) ] }).catch((e) => {console.log(e)});
        
        const collector = msg.createMessageComponentCollector({ filter: i => i.customId == 'cancel', max: 1, time: 10000 });
        collector.on('end', (collected) => {
            if (collected.size == 0) {
                tickets.delete({ channel: message.channel });
            } else {
                msg.edit({ embeds: [ package.embeds.cancel() ], components: [] }).catch(() => {});
            };
        });

        return;
    };
    if (subcommand == 'reopen') {
        if (!checkIfTicket(true)) return;

        tickets.reopenTicket({ channel: message.channel }).catch(() => {});
        return functions.reply(message, package.embeds.classic(message.author)
            .setTitle('Ticket réouvert')
            .setDescription(`<@${message.author.id}> a réouvert le ticket`)
            .setColor(message.guild.me.displayHexColor)
        ).catch(() => {});
    };
    if (subcommand == 'save') {
        if (!checkIfTicket(true)) return;

        const customId = await tickets.saveTicket({ channel: message.channel });
        
        const attachment = new Discord.MessageAttachment()
            .setFile(customId)
            .setName(`${message.channel.name}-ticket-save.html`)
            .setDescription(`Sauvegarde du ticket`)
            .setSpoiler(false)
                                
        return message.channel.send({ files: [ attachment ], embeds: [ package.embeds.classic(message.author)
            .setTitle("Sauvegarde")
            .setDescription(`Le ticket a été sauvegardé`)
            .setColor(message.guild.me.displayHexColor)
        ] }).catch((e) => {console.log(e)});
    };
    if (subcommand == 'add') {
        if (!checkIfTicket(true)) return;

        await message.guild.members.fetch();
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return functions.reply(message, package.embeds.noMember(message.author))

        message.channel.permissionOverwrites.edit(member, { VIEW_CHANNEL: true, SEND_MESSAGES: true, ATTACH_FILES: true, ADD_REACTIONS: true }).catch(() => {});
        return functions.reply(message, package.embeds.classic(message.author)
            .setTitle("Utilisateur ajouté")
            .setDescription(`<@${member.id}> a été ajouté au ticket`)
            .setColor('#00ff00')
        ).catch(() => {});
    };
    if (subcommand == 'remove') {
        if (!checkIfTicket(true)) return;

        await message.guild.members.fetch();
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) return functions.reply(message, package.embeds.noMember(message.author))

        message.channel.permissionOverwrites.edit(member, { VIEW_CHANNEL: false }).catch(() => {});
        return functions.reply(message, package.embeds.classic(message.author)
            .setTitle("Utilisateur retiré")
            .setDescription(`<@${member.id}> a été retiré du ticket`)
            .setColor('#ff0000')
        ).catch(() => {});
    };
    if (subcommand == 'rename') {
        if (!checkIfTicket(true)) return;
        let name = args.join(' ');
        if (!name) return functions.reply(message, package.embeds.noText(message.author));

        tickets.ticketRename({ channel: message.channel, name: name });
        return functions.reply(message, package.embeds.classic(message.author)
            .setTitle("Ticket renommé")
            .setDescription(`Le ticket a été renommé en ${name}`)
            .setColor(message.guild.me.displayHexColor)
        ).catch(() => {});
    };
    functions.reply(message, package.embeds.classic(message.author)
        .setTitle("Aide tickets")
        .setColor('ORANGE')
        .setDescription(`
__**Remarque :**__ les caractères tels que **\`<>\`** ou **\`[]\`** ne sont pas à utiliser lors de l'éxécution de la commande.

La commande \`${prefix}ticket\` peut prendre l'un des arguments ci-dessous :
\`create [sujet]\` pour créer un ticket
\`delete\` pour supprimer le ticket
\`close\` pour fermer le ticket
\`reopen\` pour ré-ouvrir le ticket
\`save\` pour obtenir un retranscription de la conversation
\`rename <nom du salon>\` pour renommer le ticket
\`add <@utilisateur>\` ajoute un utilisateur à un ticket
\`remove [@utilisateur]\` Retire un utilisateur à un ticket
    
Créez un panel de ticket via la commande \`${prefix}ticket-config create\`.`)
);
};