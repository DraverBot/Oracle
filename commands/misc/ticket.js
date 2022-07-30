 const Discord = require('discord.js');
const functions = require('../../assets/functions.js');
const package = functions.package();
const ticketsFunctions = require('../../assets/tickets.js');

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
module.exports.run = (message, args, client, prefix) => {
    const action = ( args.shift() || 'help' ).toLowerCase();
    message.delete().catch(() => {});

    client.db.query(`SELECT * FROM tickets WHERE guild_id="${message.guild.id}"`, (err, req) => {
        if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] }) & console.log(err);
        
        /**
         *  @returns {Discord.GuildMember}
         */
        const getMember = () => {
            const object = req.find((x) => x.channel_id === message.channel.id && x.type === "ticket-message");
            
            if (!object) {
                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Erreur")
                    .setDescription(`Oops, une erreur s'est produite. Vous n'etes pas censé voir ce message`)
                    .setColor('#ff0000')
                ] });
                return false;
            };
    
            const member = message.guild.members.cache.get(object.user_id);
            if (!member) {
                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Pas d'utilisateur")
                    .setDescription(`Je ne trouve pas le propriétaire de ce ticket.\nEssayez de le mentionnez, puis réessayez.`)
                    .setColor('#ff0000')
                ] });
                return false;
            }
    
            return member;
        };
        const isTicket = () => {
            const ticket = req.filter((x) => x.channel_id === message.channel.id && x.type !== 'panel');

            if (ticket.length === 0) {
                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Pas de ticket")
                    .setDescription(`Oops, ce salon n'est pas un ticket`)
                    .setColor('#ff0000')
                ] });
                return false;
            }
            else return true;
        }
        if (action === "create") {
            let subject = args.shift();
            if (!subject) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Sujet")
                .setDescription(`Merci de saisir un sujet lorsque vous exécutez la commande`)
                .setColor('#ff0000')
            ] });
    
            ticketsFunctions.create(message.guild, message.author, subject);
        } else if (action === 'delete') {
            if (!isTicket()) return;
    
            ticketsFunctions.delete(message.channel, message.author);
        } else if  (action === 'close') {
            if (!isTicket()) return;
    
            const member = getMember();
            if (!member) return;
    
            ticketsFunctions.close_ticket(message.guild, message.channel, member.user);
        } else if (action === 'reopen') {
            if (!isTicket()) return;
            
            const member = getMember();
            if (!member) return;
    
            ticketsFunctions.reopen(message.channel, member.user)
        } else if (action === 'save') {
            if (!isTicket()) return;

            const member = getMember();
            if (!member) return;
    
            ticketsFunctions.save_transcript(message.channel, member.user);
        } else if (action === 'rename') {
            if (!isTicket()) return;
    
            const name = args.join('-');
            if (!name) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setTitle("Pas de nom")
                .setDescription(`Merci de saisir le nouveau nom du salon`)
                .setColor('#ff0000')
            ] });
    
            message.channel.setName(name);
        } else if (action === "add") {
            if (!isTicket()) return;
    
            const user = message.guild.members.cache.get(args[0]) || message.mentions.members.first() || message.guild.members.cache.find((x) => x.user.username === message.content);
            if (!user) return message.channel.send({ embeds: [ package.embeds.noUser(message.author) ] });
    
            message.channel.permissionOverwrites.edit(user, {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: true,
                ADD_REACTIONS: true,
                READ_MESSAGE_HISTORY: true
            });
    
            message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setDescription(`<@${user.id}> a été **ajouté** au ticket.`)
                .setTitle("Ajout")
                .setColor("#00ff00")
            ] });
        } else if (action === "remove") {
            if (!isTicket()) return;
    
            const user = message.guild.members.cache.get(args[0]) || message.mentions.members.first() || message.guild.members.cache.find((x) => x.user.username === message.content);
            if (!user) return message.channel.send({ embeds: [ package.embeds.noUser(message.author) ] });
    
            message.channel.permissionOverwrites.edit(user, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                READ_MESSAGE_HISTORY: false
            });
    
            message.channel.send({ embeds: [ package.embeds.classic(message.author)
                .setDescription(`<@${user.id}> a été **retiré** du ticket.`)
                .setTitle("Retrait")
                .setColor("#00ff00")
            ] });
        } else {
            message.channel.send({ embeds: [ package.embeds.classic(message.author)
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
            ] });
        };
    });
}