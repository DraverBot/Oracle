const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const configs = require('../../assets/data/configs.json');

module.exports = {
    help: {
        cd: 10,
        permissions: ['manage_guild'],
        dm: false,
        dev: false,
        systems: []
    },
    configs: {
        name: 'config',
        description: "Configure Oracle sur votre serveur",
        options: [
            {
                name: 'paramètres',
                description: "Affiche les paramètres configurables",
                type: 'SUB_COMMAND'
            },
            {
                name: 'configurer',
                description: "Configure un paramètre",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "paramètre",
                        description: "Paramètre à configurer",
                        type: 'STRING',
                        required: true,
                        choices: configs.data.map((conf) => ({name: conf.name, value: conf.param}))
                    },
                    {
                        name: "état",
                        description: "État binaire du paramètre (si binaire)",
                        required: false,
                        type: 'BOOLEAN'
                    },
                    {
                        name: 'texte',
                        description: "Texte du paramètre (si texte)",
                        required: false,
                        type: 'STRING'
                    },
                    {
                        name: 'salon',
                        description: "Salon du paramètre (si salon)",
                        type: 'CHANNEL',
                        required: false
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
        let types = {
            boolean: 'état',
            text: 'texte',
            channel: 'salon'
        };

        if (subcommand == 'paramètres') {
            const docTypes = {
                boolean: 'binaire',
                text: 'texte',
                channel: 'salon'
            };

            let exemples = [];
            for (const type of ['boolean', 'text', 'channel']) {
                let selectedTypes = configs.data.filter(x => x.type == type);
                let selected = selectedTypes[functions.random(selectedTypes.length, 0)];

                if (functions.random(100, 0) >= 50) {
                    exemples.push(selected);
                } else {
                    exemples.unshift(selected);
                };
            };
            for (const exemple of exemples) {
                let index = exemples.indexOf(exemple);
                let data = {
                    name: docTypes[exemple.type],
                    value: `\`/config configurer paramètre: ${exemple.name} ${exemple.type == 'boolean' ? `binaire: ${functions.random(100, 0) >= 50 ? 'true':'false'}` : exemple.type == 'text' ? 'texte: Lorem ipsum' : `salon: #${interaction.guild.channels.cache.filter(x => ['GUILD_TEXT', 'GUILD_VOICE', 'GUILD_NEWS'].includes(x.type)).random()?.name ?? interaction.channel.name}`}\``,
                    inline: false
                };

                exemples[index] = data;
            };

            const embed = package.embeds.classic(interaction.user)
                .setTitle("Paramètres")
                .setDescription(`Voici la liste des paramètres configurables :\n${configs.data.map((conf) => `\`${conf.name}\` : ${conf.description} (type: [${types[conf.type]}](https://github.com/BotOracle/Documentation/blob/main/others/${docTypes[conf.type]}.md))`).join('\n')}`)
                .setColor('ORANGE')
                .addFields(exemples)
            
            interaction.reply({ embeds: [ embed ] }).catch(() => {});
        };
        if (subcommand == 'configurer') {
            let paramId = interaction.options.getString('paramètre');
            let param = configs.data.find(x => x.param == paramId);

            let value = interaction.options.get(types[param.type]);
            if(!value) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Valeur invalide")
                .setDescription(`Vous n'avez pas rentré la bonne valeur.\nUtilisez \`/config paramètres\` pour voir le type de la valeur et réessayez.`)
                .setColor('#ff0000')
            ] }).catch(() => {});

            value = param.type == 'channel' ? value.channel : value.value;

            if (param.type == 'channel' && value.type !== 'GUILD_TEXT') return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Salon incorrect")
                .setDescription(`Veuillez renseigner un **salon textuel**`)
                .setColor('#ff0000')
            ] }).catch(() => {});
            if (param.type == 'text' && value.includes('"')) return interaction.reply({ embeds: [ package.embeds.guillement(interaction.user) ] });

            if (param.type == 'channel') value = value.id;
            if (param.type == 'boolean') value = value == true ? "1" : "0";

            interaction.client.db.query(`UPDATE configs SET ${paramId}="${value}" WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                if(err) {
                    functions.sendError(err, 'query in /config cmd', interaction.user);
                    interaction.reply({ embeds: [ package.embeds.err(interaction.user) ] }).catch(() => {});
                    return;
                };

                interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Paramètre configuré")
                    .setDescription(`Le paramètre \`${param.name.toLowerCase()}\` a été configuré sur ${param.type == 'channel' ? `<#${value}>` : param.type == 'boolean' ? value == "1" ? "oui" : "non" : value}`)
                    .setColor(interaction.guild.me.displayHexColor)
                ] }).catch(() => {});
            });
        };
    }
};