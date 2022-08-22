const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dm: false,
        dev: false,
        permissions: [],
        systems: [],
    },
    configs: {
        name: "banque",
        description: "Utilisez votre banque",
        options: [
            {
                name: "déposer",
                description: `Déposer des ${package.configs.coins} dans votre banque`,
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "montant",
                        description: `Montant ${package.configs.coinsSuffix} à déposer`,
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                name: "retirer",
                description: `Retirer des ${package.configs.coins} de votre banque`,
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "montant",
                        description: `Montant ${package.configs.coinsSuffix} à retirer`,
                        type: 'INTEGER',
                        required: true
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let amount = parseInt(interaction.options.get('montant').value);
        if (amount < 0) amount = parseInt(amount.toString().slice(1));
        if (isNaN(amount)) return interaction.reply({ embeds: [ package.embeds.invalidNumber(interaction.user) ] }).catch(() => {});

        let subcommand = interaction.options.getSubcommand();
        
        let values = {
            'déposer': {
                fnt: 'deposit',
                stats: 'coins',
                notEnough: 'votre compte en banque',
                end: 'déposé',
                suffix: 'sur'
            },
            'retirer': {
                fnt: 'withdraw',
                stats: 'bank',
                notEnough: 'vous',
                end: "retiré",
                suffix: 'de'
            }
        };
        const value = values[subcommand];
        let stats = interaction.client.CoinsManager.getStats(`${interaction.guild.id}.${interaction.user.id}`);

        if (stats[value.stats] < amount) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Montant trop grand")
            .setDescription(`Vous n'avez pas assez ${package.configs.coinsSuffix} sur ${value.notEnough} pour en ${subcommand}.`)
            .setColor('#ff0000')
        ] }).catch(() => {});
        
        if (subcommand == 'déposer') {
            interaction.client.CoinsManager.deposit({ user_id: interaction.user.id, guild_id: interaction.guild.id }, amount);
        } else {
            interaction.client.CoinsManager.withdraw({ user_id: interaction.user.id, guild_id: interaction.guild.id }, amount);
        }
        
        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle(`Argent ${value.end}`)
            .setDescription(`**${amount.toLocaleString('fr-DE')} ${package.configs.coins}** ont été **${value.end}** ${value.suffix} votre compte en banque`)
            .setColor(interaction.member.displayHexColor)
        ] }).catch(() => {});
    }
}