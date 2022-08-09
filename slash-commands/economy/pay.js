const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        systems: [{name: "d'économie", value: "economy_enable", state: true}],
        cd: 5,
        dm: false,
        dev: false,
        permissions: []
    },
    configs: {
        name: "pay",
        description: `Donne un montant ${package.configs.coinsSuffix} à un utilisateur`,
        options: [
            {
                name: "montant",
                type: 'INTEGER',
                required: true,
                description: "Montant d'argent que vous voulez donner"
            },
            {
                name: "utilisateur",
                required: true,
                description: "Utilisateur à qui vous voulez donner l'argent",
                type: 'USER'
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let user = interaction.options.getUser('utilisateur');
        let amount = parseInt(interaction.options.get('montant').value);
        if (amount < 0) amount = parseInt(amount.toString().slice(1));

        if (isNaN(amount)) return interaction.reply({ embeds: [ package.embeds.invalidNumber(interaction.user) ] }).catch(() => {});
        let stats = interaction.client.CoinsManager.getStats(`${interaction.guild.id}.${interaction.user.id}`);
        if (!stats || stats.coins < amount) return interaction.reply({ embeds: [ package.embeds.notEnoughCoins(interaction.user) ] }).catch(() => {});

        await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Confirmation")
            .setDescription(`Confirmez-vous que vous voulez donner **${amount.toLocaleString('en').replace(/,/g, ' ')} ${package.configs.coins}** à <@${user.id}> ?`)
            .setColor('YELLOW')
        ],  components: [ new Discord.MessageActionRow()
            .addComponents(new Discord.MessageButton({ label: 'Oui', style: 'SUCCESS', customId: 'y' }), new Discord.MessageButton({ label: 'Non', style: 'DANGER', customId: 'n' }))
        ] }).catch(() => {});

        const msg = await interaction.fetchReply();
        const collector = msg.createMessageComponentCollector({ filter: x => x.user.id == interaction.user.id, max: 1, time: 120000 });

        collector.on('end', (collected) => {
            if (collected.size == 0 || collected.first().customId == "n") return interaction.editReply({ embeds: [ package.embeds.cancel() ] }).catch(() => {});
            interaction.client.CoinsManager.addCoins({ guild_id: interaction.guild.id, user_id: user.id }, amount);
            interaction.client.CoinsManager.removeCoins({ guild_id: interaction.guild.id, user: interaction.user.id }, amount);

            interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Transaction effectuée")
                .setDescription(`Vous avez donné **${amount.toLocaleString('en').replace(/,/g, ' ')}** ${package.configs.coins} à <@${user.id}>`)
                .setColor(interaction.member.displayHexColor)
            ], components: [] }).catch(() => {});
        });
    }
}