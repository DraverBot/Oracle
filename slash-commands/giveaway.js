const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();
const moment = require('moment');
moment.locale('fr');

module.exports = {
    configs: {
        name: 'giveaway',
        description: "Giveaways",
        options: [
            {
                name: 'liste',
                description: "Affiche la liste des giveaways",
                type: 'SUB_COMMAND'
            },
            {
                name: 'create',
                description: "Crée un giveaway",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'récompense',
                        description: "récompense données au(x) gagnant(s)",
                        required: true,
                        type: 'STRING',
                        autocomplete: false
                    },
                    {
                        name: 'temps',
                        type: 'STRING',
                        description: "Temps du giveaway",
                        autocomplete: false,
                        required: true
                    },
                    {
                        name: 'gagnants',
                        type: 'INTEGER',
                        required: true,
                        autocomplete: false,
                        description: "Nombre de gagnants au giveaway"
                    },
                    {
                        name: 'salon',
                        type: 'CHANNEL',
                        required: false,
                        autocomplete: false,
                        description: "Le salon dans lequel aura lieu le giveaway"
                    }
                ]
            },
            {
                name: 'reroll',
                description: "Reroll un giveaway",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'id',
                        description: "identifiant du message du giveaway dans le salon",
                        required: true,
                        type: 'STRING',
                        autocomplete: false
                    }
                ]
            },
            {
                name: 'end',
                description: "Met fin à un giveaway",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'id',
                        description: "Identifiant du message du giveaway dans le salon",
                        required: true,
                        autocomplete: false,
                        type: 'STRING'
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        if (!interaction.guild) return interaction.reply({ content: "Cette commande n'est pas exécutable en privé" });
        if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, 'gérer le serveur') ] }).catch(() => {});

        const client = interaction.client;

        const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'liste') {
            client.GiveawayManager.list(interaction.channel, interaction.user);
            interaction.reply({ content: "Voici la liste", ephemeral: true });
        } else if (subCommand === 'create') {
            const channel = interaction.options.get('salon') ? interaction.options.get('salon').channel : interaction.channel;

            const ms = require('ms');

            if (!ms(interaction.options.get('temps').value)) return interaction.reply({ embeds: [ package.embeds.invalidTime(interaction.user) ], ephemeral: true });
            client.GiveawayManager.start(interaction.guild, channel, interaction.user, interaction.options.get('récompense').value, interaction.options.get('gagnants').value, ms(interaction.options.get('temps').value));

            interaction.reply({ content: `Je lance un giveaway sur <#${channel.id}>`, ephemeral: true });
        } else if (subCommand === 'end') {
            let id = interaction.options.get('id').value;
            
            client.db.query(`SELECT * FROM giveaways WHERE channel_id="${interaction.channel.id}" AND guild_id="${interaction.guild.id}" AND ended="0"`, (err, req) => {
                if (err) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ], ephemeral: true });
        
                let gw = req.find(x => x.message_id === id);
                if (!gw) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Pas de giveaway")
                    .setColor('#ff0000')
                    .setDescription(`Je ne trouve pas de giveway avec l'id \`${id}\` qui n'est pas terminé dans <#${interaction.channel.id}>`)
                ], ephemeral: true });
        
                client.GiveawayManager.end(interaction.guild, gw);
                interaction.reply({ content: "Je met fin à ce giveaway", ephemeral: true });
            });
        } else if (subCommand === 'reroll') {
            let id = interaction.options.get('id').value;
            
            client.db.query(`SELECT * FROM giveaways WHERE channel_id="${interaction.channel.id}" AND guild_id="${interaction.guild.id}" AND ended="1"`, (err, req) => {
                if (err) return interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ], ephemeral: true });
        
                let gw = req.find(x => x.message_id === id);
                if (!gw) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Pas de giveaway")
                    .setColor('#ff0000')
                    .setDescription(`Je ne trouve pas de giveway avec l'id \`${id}\` qui est terminé dans <#${interaction.channel.id}>`)
                ], ephemeral: true });
        
                client.GiveawayManager.reroll(interaction.guild, gw);
                interaction.reply({ content: "Je reroll ce giveaway", ephemeral: true });
            });
        }
    }
}