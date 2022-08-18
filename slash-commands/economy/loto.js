const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const ms = require('ms');

module.exports = {
    help: {
        cd: 5,
        dm: false,
        dev: false,
        systems: [],
        permissions: []
    },
    configs: {
        name: "loto",
        description: "Gère un loto sur le serveur",
        options: [
            {
                name: 'gérer',
                description: "Gère le loto",
                type: "SUB_COMMAND_GROUP",
                options: [
                    {
                        name: "démarrer",
                        description: "Lance le loto sur le serveur",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: "récompense",
                                description: `Récompense en ${package.configs.coins} du loto`,
                                type: 'INTEGER',
                                required: true
                            },
                            {
                                name: 'gagnants',
                                description: "Nombre de numéro gagnants à tirer (minimum 5)",
                                type: 'INTEGER',
                                required: true
                            },
                            {
                                name: "complémentaires",
                                description: "Nombre de numéro complémentaires à tirer (minimum 2)",
                                type: 'INTEGER',
                                required: true
                            },
                            {
                                name: "temps",
                                description: "Temps avant la fin du loto (ex: 1d)",
                                type: 'STRING',
                                required: true
                            }
                        ]
                    },
                    {
                        name: "tirage",
                        description: "Fait le tirage du loto",
                        type: 'SUB_COMMAND'
                    }
                ]
            },
            {
                name: 'participer',
                description: "Participez au loto en cours",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "gagnants",
                        description: "Les numéro gagnants que vous jouez (ex: 15 68 46 75 12)",
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: "complémentaires",
                        description: "Les numéro complémentaires que vous jouez (ex: 94 60)",
                        required: true,
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
        const subcommand = interaction.options.getSubcommand();

        if (subcommand == 'démarrer') {
            if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, "gérer le serveur") ] }).catch(() => {});
            const reward = parseInt(interaction.options.get('récompense').value);
            const numbers = parseInt(interaction.options.get('gagnants').value);
            const complementaries = parseInt(interaction.options.get('complémentaires').value);
            const time = ms(interaction.options.get('temps').value);

            if (!time) return interaction.reply({ embeds: [ package.embeds.invalidTime(interaction.user) ] }).catch(() => {});
            if (isNaN(reward) || isNaN(numbers) || isNaN(complementaries)) return interaction.reply({ embeds: [ package.embeds.invalidNumber(interaction.user) ] }).catch(() => {});

            if (reward < 1 || numbers < 5 || complementaries < 2) return interaction.reply({ embeds: [ package.embeds.invalidNumber(interaction.user) ] }).catch(() => {});
            const result = interaction.client.LotoManager.start({ 
                numbers,
                complementaries,
                reward,
                time,
                guildId: interaction.guild.id
            });

            interaction.reply({ embeds: [ package.embeds.loto.started(interaction.user, numbers, complementaries, reward, time) ] }).catch(() => {});
        };
        if (subcommand == 'tirage') {
            if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, "gérer le serveur") ] }).catch(() => {});

            const result = interaction.client.LotoManager.end(interaction.guild.id);
            let embed;
            switch(result) {
                case 'invalid loto':
                    embed = package.embeds.loto.invalidLoto(interaction.user, 'end');
                break;
                default:
                    let x = result;
                    x.user = interaction.user;
                    embed = package.embeds.loto.end(x);
                break;
            };

            if (typeof result == 'object' && result.length > 0) {
                result.forEach((winner) => {
                    interaction.client.CoinsManager.addCoins({ user_id: winner.user_id, guild_id: interaction.guild.id }, winner.reward.toFixed(0));
                });
            };
            interaction.reply({ embeds: [ embed ] }).catch(() => {});
        };
        if (subcommand == 'participer') {
            const numbers = interaction.options.getString('gagnants').split(' ').map(x => parseInt(x));
            const complementaries = interaction.options.getString('complémentaires').split(' ').map(x => parseInt(x));
            
            const result = interaction.client.LotoManager.addParticipation({
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                numbers, complementaries
            });

            let embed = package.embeds.loto;
            switch(result) {
                case 'invalid loto':
                    embed = embed.invalidLoto(interaction.user, 'participate');
                break;
                case 'invalid numbers':
                case 'invalid arrays':
                case 'invalid compared':
                    embed = embed.invalidNumbers(interaction.user);
                break;
                case 'user already exists':
                    embed = embed.alreadyParticipate(interaction.user);
                break;
                case 'added':
                    embed = embed.added(interaction.user, numbers, complementaries);
                break;
            };

            interaction.reply({ embeds: [ embed ] }).catch(() => {});
        }
    }
};