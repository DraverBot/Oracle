const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        dm: false,
        permissions: ['manage_guild'],
        cd: 5,
        systems: [{name: "d'économie", value: 'economy_enable', state: true}],
        dev: false
    },
    configs: {
        name: 'admin-coins',
        description: "Gère les " + package.configs.coins + " sur le serveur",
        options: [
            {
                name: 'ajouter',
                description: `Ajoute des ${package.configs.coins} à un utilisateur`,
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'utilisateur',
                        description: "Utilisateur à qui ajouter des " + package.configs.coins,
                        type: 'USER',
                        required: true
                    },
                    {
                        name: 'montant',
                        description: `Montant ${package.configs.coinsSuffix} à ajouter`,
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                name: 'retirer',
                description: `Retire des ${package.configs.coins} à un utilisateur`,
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'utilisateur',
                        description: "Utilisateur à qui retirer des " + package.configs.coins,
                        type: 'USER',
                        required: true
                    },
                    {
                        name: 'montant',
                        description: `Montant ${package.configs.coinsSuffix} à ajouter`,
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                name: "réinitialiser",
                description: `Réinitialiser des ${package.configs.coins}`,
                type: 'SUB_COMMAND_GROUP',
                options: [
                    {
                        name: 'utilisateur',
                        description: `Réinitialiser des ${package.configs.coins} à un utilisateur`,
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'utilisateur',
                                description: "Utilisateur à qui ajouter des " + package.configs.coins,
                                type: 'USER',
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'serveur',
                        description: `Réinitialiser les ${package.configs.coins} du serveur`,
                        type: 'SUB_COMMAND'
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand == 'ajouter') {
            let member = interaction.options.getMember('utilisateur');
            let amount = parseInt(interaction.options.get('montant').value);

            if (amount < 0) amount = parseInt(amount.toString().slice(1));
            amount = amount.toFixed(0);
            if (isNaN(amount)) return interaction.reply({ embeds: [ package.embeds.invalidNumber(interaction.user) ] }).catch(() => {});
            if (!functions.checkAllConditions(interaction.guild, interaction.channel, interaction.member, member, interaction)) return;

            interaction.client.CoinsManager.addCoins({ user_id: member.id, guild_id: interaction.guild.id }, amount);

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle(`${package.configs.coins} ajouté${amount > 1 ? 's':''}`)
                .setDescription(`**${amount.toLocaleString('en').replace(/,/g, ' ')} ${package.configs.coins}** ont été ajoutés à <@${member.id}>`)
                .setColor('#00ff00')
            ] }).catch(() => {});
        };
        if (subcommand == 'retirer') {
            let member = interaction.options.getMember('utilisateur');
            let amount = parseInt(interaction.options.get('montant').value);

            if (amount < 0) amount = parseInt(amount.toString().slice(1));
            amount = amount.toFixed(0);
            if (isNaN(amount)) return interaction.reply({ embeds: [ package.embeds.invalidNumber(interaction.user) ] }).catch(() => {});
            if (!functions.checkAllConditions(interaction.guild, interaction.channel, interaction.member, member, interaction)) return;

            const result = interaction.client.CoinsManager.removeCoins({ user_id: member.id, guild_id: interaction.guild.id }, amount);
            if (result == 'not enough coins' || result == false) return interaction.reply({ embeds: [ package.embeds.notEnoughCoins(member.user) ] }).catch(() => {});

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle(`${package.configs.coins} retiré${amount > 1 ? 's':''}`)
                .setDescription(`**${amount.toLocaleString('en').replace(/,/g, ' ')} ${package.configs.coins}** ont été retirés à <@${member.id}>`)
                .setColor('#ff0000')
            ] }).catch(() => {});
        };
        if (subcommand == 'utilisateur') {
            let member = interaction.options.getMember('utilisateur');
            
            if (!functions.checkAllConditions(interaction.guild, interaction.channel, interaction.member, member, interaction)) return;

            await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Confirmation")
                .setDescription(`Confirmez-vous que vous voulez réinitialiser les ${package.configs.coins} de <@${member.id}>`)
                .setColor('YELLOW')
            ], components: [ new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton({ label: 'Oui', customId: 'y', style: 'SUCCESS' }),
                new Discord.MessageButton({ label: 'Non', customId: 'n', style: 'DANGER' })
            ) ] }).catch(() => {});
            const msg = await interaction.fetchReply();

            const collector = msg.createMessageComponentCollector({ filter: x => x.user.id == interaction.user.id, time: 120000, max: 1 });
            collector.on('end', (collected) => {
                if (collected.size == 0 || collected.first().customId == 'n') return interaction.editReply({ embeds: [ package.embeds.cancel() ], components: [] }).catch(() => {});

                interaction.client.CoinsManager.resetUser({ user_id: member.id, guild_id: interaction.guild.id });
                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle(`${package.configs.coins} réinitialisés`)
                    .setDescription(`Les ${package.configs.coins} de <@${member.id}> ont été réinitialisés`)
                    .setColor(interaction.guild.me.displayHexColor)
                ], components: [] }).catch(() => {});
            });
        };
        if (subcommand == 'serveur') {
            await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Confirmation")
                .setDescription(`Confirmez-vous que vous voulez réinitialiser les ${package.configs.coins} de ${interaction.guild.name}`)
                .setColor('YELLOW')
            ], components: [ new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton({ label: 'Oui', customId: 'y', style: 'SUCCESS' }),
                new Discord.MessageButton({ label: 'Non', customId: 'n', style: 'DANGER' })
            ) ] }).catch(() => {});
            const msg = await interaction.fetchReply();

            const collector = msg.createMessageComponentCollector({ filter: x => x.user.id == interaction.user.id, time: 120000, max: 1 });
            collector.on('end', (collected) => {
                if (collected.size == 0 || collected.first().customId == 'n') return interaction.editReply({ embeds: [ package.embeds.cancel() ], components: [] }).catch(() => {});

                interaction.client.CoinsManager.resetGuild(interaction.guild.id);
                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle(`${package.configs.coins} réinitialisés`)
                    .setDescription(`Les ${package.configs.coins} de ${interaction.guild.name} ont été réinitialisés`)
                    .setColor(interaction.guild.me.displayHexColor)
                ], components: [] }).catch(() => {});
            });
        };
    }
}