const Discord = require('discord.js');
const fs = require('fs');
const ms = require('ms');
const moment = require('moment');
const embeds = require('./embeds');
const functions = require('./functions.js');
const emojis = require('./data/emojis.json');
const data = require('./data/data.json');

moment.locale('fr');

const capitalize = str => str.split(' ').map(x => x[0].toUpperCase() + x.slice(1)).join(' ');
/**
 * @param {Number} number 
 */
const numberToHuman = number => number.toLocaleString('fr-DE');

module.exports = {
    package: () => {
        const package = {
            embeds: embeds,
            emojis: require('./data/emojis.json'),
            perms: require('./data/perms.json'),
            personnages: require('./rpg/personnages.json'),
            configs: require('./data/data.json'),
            rubis: require('./rpg/rubis.json')
        }

        return package;
    },
    /**
    * @param {Discord.User} user 
    * @param {Discord.Channel} channel
    * @param {Array} list 
    * @param {String} paginationName 
    */
    pagination: (user, channel, list, paginationName) => {
        const pages = list;
        pages.forEach((page) => {
            const index = (pages.indexOf(page) + 1).toLocaleString();
            const total = pages.length.toLocaleString();

            page.setFooter({ text: `Page ${index}/${total}` });
        });

       let index = 0;
       let id = paginationName;

       const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setEmoji('◀')
                    .setCustomId('arrière')
                    .setStyle('SECONDARY'),
                new Discord.MessageButton()
                    .setEmoji('🔢')
                    .setCustomId('select')
                    .setStyle('PRIMARY'),
                new Discord.MessageButton()
                    .setStyle('SECONDARY')
                    .setEmoji('▶')
                    .setCustomId('avant'),
                new Discord.MessageButton()
                    .setStyle('DANGER')
                    .setCustomId('close')
                    .setEmoji('❌')
            )

       channel.send({ embeds: [list[index]], components: [ row ] }).then(/** @param {Discord.Message} msg*/ (msg) => {
           const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id == user.id , time: 60000*5});

           /**
            * @param {Discord.ButtonInteraction} interaction 
            */
           const fnt = async(interaction) => {
               if (interaction.customId == 'arrière') {
                   if (index == 0) return;
                   index--;

                   await msg.edit({ embeds: [ pages[index] ] }).catch(() => {});
               };

               if (interaction.customId == 'avant') {
                   if (index == pages.length) return;
                   index++;

                   await msg.edit({ embeds: [ pages[index] ] }).catch(() => {});
               };

               if (interaction.customId === 'close') {
                   await msg.delete().catch(() => {});

                   channel.send({ content: `<@${user.id}> vous avez fermé le paginateur \`${id}\`` }).catch(() => {});
                   collector.stop('closed');
               };
           
               if (interaction.customId === 'select') {
                   const msgCollector = channel.createMessageCollector({ filter: (m) => m.author.id == user.id , time: 120000});

                   var trash = [];
                   
                   channel.send({ content: `<@${user.id}> Quelle page souhaitez-vous consulter ?` }).then((x) => {
                       trash.push(x);
                   });

                   msgCollector.on('collect', async(m) => {
                       trash.push(m);
                       if (m.content.toLowerCase() == 'cancel') {
                           channel.send({ content: "Annulé" }).then((x) => {
                               setTimeout(() => {x.delete().catch(() => {})}, 5000);
                           });

                           msgCollector.stop('closed');
                           return;
                       };

                       let number = parseInt(m.content);
                       if (isNaN(number)) return channel.send({ embeds: [ embeds.invalidNumber(user) ] }).then(x => trash.push(x));
                       number--;
                       if (number < 0 || number > pages.length) return channel.send({ content: 'Cette page n\'existe pas' }).then(x => trash.push(x));

                       const selected = pages[number];

                       await msg.edit({ embeds: [ selected ] }).catch(() => {});
                       index = number;
                       msgCollector.stop();
                   });

                   msgCollector.on('end', (collected, reason) => {
                       trash.forEach((x) => {
                           x.delete().catch(() => {});
                       });
                   });
                };
            }

            collector.on('collect', (interaction) => {
                fnt(interaction);
                interaction.deferUpdate()
            });
       });
    },
    /**
     * @deprecated use `reply` instead
     */
    lineReply: (targetMessageID, channel, content, embed) => {
       let isEmbed = embed || false;

       const object = {
           data: {
               message_reference: {
                   message_id: targetMessageID,
               },
           }
       };
       if (isEmbed) object.data.embeds = [ content ];
       else object.data.content = content;

       const bot = channel.client;

       bot.api.channels[channel.id].messages.post(object);
    },
    getNumbersEmoji: () => {
        return [
            '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'
        ]
    },
   /**
    * @returns {Number}
    */
   random: (max, min) => {
       return Math.floor(Math.random() * (max || 100)) + (min || 0);
   },
   /**
    * @returns {Array} 
    * @description renvoie un tableau contenant toutes les lettres en minuscule.
    */
   letters: () => {
       return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
   },
    /**
     * @param {Discord.GuildMember} member 
     * @param {Discord.GuildMember} modo 
     */
    compareRoles: (member, modo) => {
        let memberRole = member.roles.highest.position;
        let modoRole= modo.roles.highest.position;

        if (memberRole >= modoRole) return false;
        return true;
    },
    addCase: (guild_id, user_id, mod_id, reason, action) => {
        const { client } = require('../index');

        client.db.query(`INSERT INTO mod_cases (guild_id, user_id, mod_id, action, reason) VALUES ("${guild_id}", "${user_id}", "${mod_id}", "${action}", "${reason}")`, (error, request) => {
            if (error) console.error(error);
        });
    },
    /**
     * 
     * @param {Discord.Guild} guild 
     * @param {Discord.MessageEmbed} embed 
     * @param {Discord.TextChannel} test
     */
    log: (guild, embed) => {
        const client = guild.client;
        let action = capitalize(embed.title);

        client.db.query(`SELECT logs_enable, logs_channel FROM configs WHERE guild_id="${guild.id}"`, (err, req) => {
            if (err) return console.log(err);

            if (req.length === 0) return;
            const data = req[0];

            if (!data.logs_enable) return;
            const channel = guild.channels.cache.get(data.logs_channel);

            if (!channel) return;
            channel.send({ embeds: [ embed ] }).catch(() => {});
        });
    },
    /**
     * @param {Discord.Guild} guild 
     * @param {Discord.TextChannel} channel
     * @param {Discord.GuildMember} modo 
     * @param {Discord.GuildMember} member 
     * @param {?Discord.CommandInteraction} interaction
     */
    checkAllConditions: (guild, channel, modo, member, interaction) => {
        const { compareRoles } = require('./functions.js')
        let fnt = (params) => {
            if (interaction) {
                if (interaction.replied) {
                    interaction.editReply(params).catch(() => {});
                } else {
                    interaction.reply(params).catch(() => {});
                }
            } else {
                channel.send(params);
            }
        }

        if (!member.moderatable) {
            fnt({ embeds: [ embeds.classic(modo.user)
                .setTitle("Non modérable")
                .setDescription(`Oops, je ne peux pas effectuer d'actions de modération sur ce membre`)
                .setColor('#ff0000')
            ] });
            return false;
        }
        if (!compareRoles(member, modo)) {
            fnt({ embeds: [ embeds.notEnoughHiger(modo.user, member.user) ] })
            return false;
        };
        if (!compareRoles(member, guild.me)) {
            fnt({ embeds: [ embeds.classic(modo.user)
                .setTitle("Pas assez élevé")
                .setDescription(`Oops, il semblerait que <@${member.id}> soit supérieur ou égal à moi dans la hiérarchie des rôles.`)
                .setColor('#ff0000')
            ] });
            return false;
        };
        if (guild.ownerId === member.id) {
            fnt({ embeds: [ embeds.classic(modo.user)
                .setTitle("Propriétaire")
                .setDescription(`Oops, il semblerait que <@${member.id}> soit le propriétaire du serveur.`)
                .setColor('#ff0000')
            ] });
            return false;
        };
        return true;
    },
    /**
     * @param {Number} number 
     * @deprecated Use `numberToHuman` instead
     */
    separeNumber(number) {
        numberToHuman(number);
    },
    getPersonnage(personnage) {
        return require('../assets/rpg/personnages.json')[personnage];
    },
    /**
     * @param {Discord.TextChannel} channel 
     * @param {Discord.User} user 
     * @param {Array} texts 
     */
    rpgPagination(channel, user, pages) {
        const texts = pages;
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('past')
                    .setEmoji('⬅')
                    .setStyle('SECONDARY'),
                new Discord.MessageButton()
                    .setCustomId('next')
                    .setEmoji('➡')
                    .setStyle('SECONDARY')
            );
        
        let index = 0;
        channel.send({ content: texts[index], components: [ row ] }).then((sent) => {
            const collector = sent.createMessageComponentCollector({ filter: i => i.user.id === user.id, time: 120000 });
            collector.on('collect', (interaction) => {
                collector.resetTimer();
                let text = "page suivante";

                if (interaction.customId === 'past') {
                    if (index === 0) return interaction.reply({ content: "Cette page n'existe pas", ephemeral: true });

                    index--;
                    text = "page précédente";
                    sent.edit({ content: texts[index] });
                } else {
                    index++;
                    if (index + 1 === texts.length) return collector.stop('ended');
                    
                    sent.edit({ content: texts[index] }).catch(console.log);
                };
                interaction.reply({ content: text }).then((x) => {
                    interaction.deleteReply().catch(console.log);
                });
            });

            collector.on('end', (collected, reason) => {
                if (reason == 'ended') {
                    sent.edit({ content: texts[texts.length - 1], components: [ ] }).catch(() => {});
                };
            });
        });
    },
    generateLineReplyContent(content, message) {
        let xdata = content;
        xdata.data = {
            message_reference: {
                message_id: message.id,
                channel_id: message.channel.id,
                guild_id: message.guild.id
            }
        };

        return xdata;
    },
    generateChoiceButton(textConfirm, textCancel) {
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setStyle('SUCCESS')
                    .setLabel(textConfirm || 'Valider')
                    .setCustomId('confirm'),
                new Discord.MessageButton()
                    .setCustomId('cancel')
                    .setLabel(textCancel || 'Annuler')
                    .setStyle('DANGER')
            );

        return row;
    },
    /**
     * @param {Discord.User} user
     */
    generateBiEmbed(user) {
        const client = user.client;
        
        const embed = embeds.classic(user)
            .setTitle("Bot infos")
    },
    /**
     * @param {Discord.Message} message
     * @param {String | Discord.MessageEmbed} content
     * @param {Discord.MessageActionRow} row
     */
    reply: async(message, content, row) => {
        let data = {
            reply: { messageReference: message }
        };

        if (typeof content == "string") data.content = content;
        else data.embeds = [ content ];

        if (row !== undefined) data.components = [ row ];

        return await message.channel.send(data).catch(() => {});
    },
    /**
     * @param {Discord.User} user
     */
    sendError: (err, cmd, user) => {
        user.client.fetchWebhook(data.error.id, data.error.token).then((web) => {
            if (!web) return;

            let embed = embeds.classic(user)
                .setColor('ORANGE')
                .setDescription(`\`\`\`${err}\`\`\``)
                .addFields(
                    {
                        name: 'Commande', value: cmd, inline: true
                    },
                    {
                        name: 'Utilisateur', value: `<@${user.id}> ${user.id} ${user.tag}`, inline: true
                    }
                )
                .setTitle("Erreur")

            web.send({ embeds: [ embed ] }).catch(() => {});
        })
    },
    capitalize,
    numberToHuman,
    /**
     * @param {Discord.Client} client 
     */
    async privateSlashCommandsBuilder(client) {
        const commands = require('./data/slashCommands');

        const commandFiles = fs.readdirSync('./private-slash-commands');
        for (const file of commandFiles) {
            const props = require(`../private-slash-commands/${file}`);

            client.application.commands.create(props.configs, props.guild).catch(() => {});
            commands.set(`${props.guild}-${props.configs.name}`, props);
        };

        await client.guilds.fetch();
        client.guilds.cache.forEach(async(guild) => {
            await guild.commands.fetch().catch(() => {});
            guild.commands.cache.forEach((cmd) => {
                if (cmd && !commandFiles.includes(`${guild.id}-${cmd.name}.js` && !commandFiles.includes(`${cmd.name}.js`))) {
                    cmd.delete().catch(() => {});
                };
            });
        });
    }
}