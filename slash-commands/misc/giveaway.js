const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const moment = require('moment');
moment.locale('fr');

module.exports = {
    configs: {
        name: 'giveaway',
        description: "Giveaways",
        options: [
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
                    },
                    {
                        name: "bonus",
                        type: 'STRING',
                        required: false,
                        description: "Identifiants des rôles bonus (séparés par un espace)"
                    },
                    {
                        name: "requis",
                        type: 'STRING',
                        required: false,
                        description: "Identifiants des rôles requis (séparés par un espace)"
                    },
                    {
                        name: "interdits",
                        type: 'STRING',
                        required: false,
                        description: "Identifiants des rôles interdits (séparés par un espace)"
                    },
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
    help: {
        dm: false,
        dev: false,
        permissions: ['manage_guild'],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const client = interaction.client;

        const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'create') {
            const channel = interaction.options.get('salon') ? interaction.options.get('salon').channel : interaction.channel;

            const ms = require('ms');

            if (!ms(interaction.options.get('temps').value)) return interaction.reply({ embeds: [ package.embeds.invalidTime(interaction.user) ], ephemeral: true });
            let bonus = interaction.options.getString('bonus');
            let required = interaction.options.getString('requis');
            let denied = interaction.options.getString('interdits');

            if (bonus) bonus = bonus.split(' ');
            if (required) required = required.split(' ');
            if (denied) denied = denied.split(' ');
            if (!bonus) bonus = [];
            if (!required) required = [];
            if (!denied) denied = [];

            client.GiveawayManager.start({
                reward: interaction.options.getString('récompense'),
                winnerCount: interaction.options.get('gagnants').value,
                hosterId: interaction.user.id,
                channel: channel,
                time: ms(interaction.options.get('temps').value),
                bonusRoles: bonus,
                requiredRoles: required,
                deniedRoles: denied
            });

            interaction.reply({ content: `Je lance un giveaway sur <#${channel.id}>`, ephemeral: true });
        } else if (subCommand === 'end') {
            let id = interaction.options.get('id').value;
            
            const result = interaction.client.GiveawayManager.end(id);
            if (result == 'already ended') return interaction.reply({ embeds: [ package.embeds.giveaway.alreadyEnded(interaction.user) ] }).catch(() => {});
            if (['no giveaway', 'no guild', 'no channel', 'no message'].includes(result)) return interaction.reply({ embeds: [ package.embeds.giveaway.noGw(interaction.user, id) ] }).catch(() => {});

            interaction.reply({ content: "Giveaway terminé", ephemeral: true }).catch(() => {});
        } else if (subCommand === 'reroll') {
            let id = interaction.options.get('id').value;
            
            const result = interaction.client.GiveawayManager.reroll(id);
            if (result == 'not ended') return interaction.reply({ embeds: [ package.embeds.giveaway.notEnded(interaction.user) ] }).catch(() => {});
            if (['no giveaway', 'no guild', 'no channel', 'no message'].includes(result)) return interaction.reply({ embeds: [ package.embeds.giveaway.noGw(interaction.user, id) ] }).catch(() => {});
            
            interaction.reply({ content: "Je reroll ce giveaway", ephemeral: true });
        }
    }
}