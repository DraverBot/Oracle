const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        systems: [],
        cd: 5,
        dev: false,
        dm: false,
        permissions: []
    },
    configs: {
        name: 'inventaire',
        description: "Affiche votre inventaire"
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Chargement")
            .setDescription(`Chargement de votre inventaire ${package.emojis.loading}`)
            .setColor(interaction.guild.me.displayHexColor)
        ] }).catch(() => {});

        interaction.client.db.query(`SELECT item_name, item_type FROM inventory WHERE guild_id="${interaction.guild.id}" AND user_id="${interaction.user.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, 'query in /inventaire', interaction.user);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                return;
            };

            if (req.length == 0) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Inventaire vide")
                .setDescription(`Vous n'avez rien dans votre inventaire`)
                .setColor(interaction.guild.me.displayHexColor)
            ] }).catch(() => {});

            let inventaire = package.embeds.classic(interaction.user)
                .setTitle("Inventaire")
                .setDescription(`Voici votre inventaire dans **${interaction.guild.name}**`)
                .setColor(interaction.member.displayHexColor)
            
            let items = {};
            for (const item of req) {
                let quantity = items[item.item_name]?.quantity ?? 0;
                items[item.item_name] = { quantity: quantity + 1, type: item.item_type };
            };

            const addField = (embed, data, index) => {
                let returned = index;
                if (index == 3) {
                    returned = 0;
                    embed.addField('\u200b', '\u200b', false);
                };

                embed.addField(data.type == 'role' ? 'Rôle' : 'Étiquette' + `${data.quantity > 1 ? ` (x${data.quantity})`:``}`, data.name, true);
                return returned + 1;
            };

            let datas = Object.keys(items).map((x) => ({ name: x, quantity: items[x].quantity, type: items[x].type }));
            let i = 0;
            for (const data of datas) {
                i = addField(inventaire, data, i);
            };

            interaction.editReply({ embeds: [ inventaire ] }).catch(() => {});
        });
    }
}