const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const fs = require('fs');

module.exports = {
    configs: {
        name: 'csc',
        description: "Gère les slash commandes personnalisées",
        options: [
            {
                name: 'créer',
                description: "Créer une slash commande personnalisée",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'nom',
                        description: "Nom de la commande",
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: "réponse",
                        description: "Réponse de la commande",
                        required: true,
                        type: 'STRING'
                    },
                    {
                        name: 'embed',
                        description: "Si la réponse doit être un embed",
                        required: true,
                        type: 'BOOLEAN'
                    },
                    {
                        name: 'titre',
                        description: "Titre de l'embed",
                        required: false,
                        type: 'STRING'
                    },
                    {
                        name: 'couleur',
                        description: "Couleur de l'embed (optionnel)",
                        required: false,
                        type: 'STRING'
                    }
                ]
            },
            {
                name: "supprimer",
                description: "Supprimer une slash commande personnalisée",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'nom',
                        description: "nom de la commande",
                        required: true,
                        type: 'STRING'
                    }
                ]
            },
            {
                name: 'liste',
                description: "Liste des slash commandes personnalisées du serveur",
                type: 'SUB_COMMAND'
            },
            {
                name: 'variables',
                description: "Variables disponibles en réponse",
                type: 'SUB_COMMAND'
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
        const commands = fs.readdirSync(`./private-slash-commands`).filter(x => x.startsWith(interaction.guild.id)).map(x => x.slice((`${interaction.guild.id}-`).length)).map(x => x.substring(0, x.indexOf('.js')));
        const command = interaction.options.getSubcommand();

        if (command == "variables") {
            const variables = ("user.name pseudo de l'utilisateur&user.id identifiant de l'utilisateur&user.mention mention de l'utilisateur&user.tag tag de l'utilisateur&server.name nom du serveur&server.count nombre de membres dans le serveur&server.id identifiant du serveur&channel.name nom du salon&channel.mention mention du salon&mention.id identifiant du salon&args arguments de la commande&mp envoie la réponse en messages privés&mine.craft Minecraft !").split('&').map((x) => `\`{${x.split(' ')[0]}}\` : ${x.split(' ').slice(1).join(' ')}`).join('\n');

            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Variables")
                .setDescription(`Utilisez la liste de variables ci-dessous pour pimenter vos commandes !\n\n${variables}`)
                .setColor(interaction.guild.me.displayHexColor)
            ] });
        };
        if (command == "créer") {
            const slashCommands = require('../../assets/data/slashCommands');
            let name = interaction.options.getString('nom').split(' ')[0].toLowerCase();
            let reponse = interaction.options.getString('réponse');
            let isEmbed = interaction.options.getBoolean('embed');
            let title = interaction.options.getString('titre');
            let color = interaction.options.get('couleur')?.value ?? interaction.guild.me.displayHexColor;

            if (slashCommands.has(name)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Commande existante")
                .setDescription(`Cette commande existe déjà sur Oracle`)
                .setColor('#ff0000')
            ] });
            if (commands.includes(name)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Commande existante")
                .setDescription(`Cette commande existe déjà sur votre serveur.\nPour la modifier, supprimez la puis recréez la.`)
                .setColor('#ff0000')
            ] })
            
            if (isEmbed && !title) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Titre manquant")
                .setDescription(`Vous avez oublié de préciser le **titre** de l'embed`)
                .setColor('#ff0000')
            ] });
            const reg = /^#[0-9A-F]{6}$/i;
            if (!reg.test(color)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Couleur invalide")
                .setDescription(`Vous avez saisi une couleur invalide.\nUtilisez le code hexadécimal.\nExemple :\n> \`#AA19EE\``)
                .setColor('#ff0000')
            ] });

            reponse = reponse.replace(/{mine\.craft}/g, 'Minecraft !');

            
            const fileContent = `const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    guild: "${interaction.guild.id}",
    configs: {
        name: '${name}',
        description: "Commande personnalisée de ${interaction.guild.name.replace(/"/g, '\\"')}"${reponse.includes('{args}') ? `,
        options: [
            {
                name: 'arguments',
                description: "Argument de la commande",
                type: 'STRING',
                required: true
            }
        ]`:''}
    },
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    run: (interaction) => {
        let text = \`${reponse.replace(/`/g, '\\`')}\`;
    
        ${reponse.includes('{args}') ? `let args = interaction.options.getString('arguments');`:''}
    
        const variables = ("user.name interaction.user.username&user.id interaction.user.id&user.tag interaction.user.discriminator&server.name interaction.guild.name&server.count interaction.guild.memberCount&server.id interaction.guild.id&channel.name interaction.channel.name&mention.id interaction.channel.id${reponse.includes('{args}') ? '&args args':''}").split('&').map((x) => ({reg: \`{\${x.split(' ')[0]}}\`, text: eval(x.split(' ')[1])}));
        const others = [{reg: '{user.mention}', text: \`<@\${interaction.user.id}>\`}, {reg: '{channel.mention}', text: \`<#\${interaction.channel.id}>\`}, {reg: '{mp}', text: '** **'}];

        for (const other of others) {
            variables.push(other);
        };
    
        for (const variable of variables) {
            let regex = new RegExp(variable.reg, 'g');
            text = text.replace(regex, variable.text);
        };
    
        let data = {};${isEmbed ? `
        data.embeds = [ package.embeds.classic(interaction.user)
            .setTitle("${title.replace(/"/g, '\\"')}")
            .setDescription(text)
            .setColor("${color}")
        ]`:`
        data.content = text`}
    
        ${reponse.includes('{mp}') ? `
        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle("Messages privés")
            .setDescription("La réponse vous a été envoyée par messages privés.\\nSi vous ne l'avez pas reçu, débloquez vos messages privés et réessayez")
            .setColor('YELLOW')
        ] }).catch(() => {});
        
        interaction.user.send(data).catch(() => {});`:`
        interaction.reply(data).catch(() => {});`}
    }
};`;

            fs.writeFile(`./private-slash-commands/${interaction.guild.id}-${name}.js`, fileContent, (err) => {
                interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Commande créée")
                    .setDescription(`La commande \`/${name}\` a été **${commands.includes(name) ? "modifiée" : "créée"}**`)
                    .setColor('ORANGE')
                ] });
    
                functions.privateSlashCommandsBuilder(interaction.client);
            });
            interaction.member.voice
        };
        if (command == 'supprimer') {
            let name = interaction.options.getString('nom');
            if (!commands.includes(name)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Commande inexistante")
                .setDescription(`Cette commande n'existe pas`)
                .setColor('#ff0000')
            ] });

            fs.rmSync(`./private-slash-commands/${interaction.guild.id}-${name}.js`);
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Commande supprimée")
                .setDescription(`La commande \`/${name}\` a été supprimée`)
                .setColor(interaction.guild.me.displayHexColor)
            ] });

            const slashCommands = require('../../assets/data/slashCommands');
            slashCommands.delete(`${interaction.guild.id}-${name}`);
            

            functions.privateSlashCommandsBuilder(interaction.client);
        };
        if (command == 'liste') {
            if (commands.length == 0) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Pas de commandes")    
                .setDescription(`Aucune slash commande personnalisée n'a été configurée sur ${interaction.guild.name}`)
                .setColor(interaction.guild.me.displayHexColor)
            ] });

            /**
             * @param {String} cmdName 
             * @param {Discord.MessageEmbed} embed 
             */
            const embedSet = (cmdName, embed) => {
                if (embed.fields.length == 2) embed.addField('\u200b', '\u200b', false);
                embed.addField('Slash commande personnalisée', `\`/${cmdName}\``, true)
            };
            const generateEmbed = () => {
                return package.embeds.classic(interaction.user)
                    .setTitle("Slash commandes personnalisées")
                    .setDescription(`Il y a **${commands.length}** slash commande${commands.length > 1 ? 's personnalisées':' personnalisée'} sur ${interaction.guild.name}`)
                    .setColor(interaction.guild.me.displayHexColor)
            };

            if (commands.length <= 4) {
                const embed = generateEmbed();
                for (const cmdName of commands) {
                    embedSet(cmdName, embed)
                };

                interaction.reply({ embeds: [ embed ] });
            } else {
                let now = generateEmbed();
                    
                var embeds = [];
                let pile = false;
                let count = 0;
                    
                for (let i = 0; i < commands.length; i++) {
                    const warn = commands[i];
                        
                    embedSet(warn, now);
                    
                    pile = false;

                    count++;
                    if (count === 4) {
                        count=0;
                        pile = true;
                        embeds.push(now);
        
                        now = null;
                        now = generateEmbed();
                    }
                };
        
                if (!pile) embeds.push(now);
                    
                functions.pagination(interaction.user, interaction.channel, embeds, `slash commandes personnalisées`);
                interaction.reply({ content: "Slash commandes personnalisées", ephemeral: true });
            }
        }
    }
}