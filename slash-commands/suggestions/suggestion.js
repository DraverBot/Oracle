const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const { findBestMatch } = require('string-similarity');

module.exports = {
    help: {
        dm: 0,
        systems: [],
        permissions: [],
        cd: 5,
        dev: false
    },
    configs: {
        name: 'suggestion',
        description: "Utilise le système de suggestions",
        options: [
            {
                name: 'suggérer',
                type: 'SUB_COMMAND',
                description: "Fait une suggestion",
                options: [
                    {
                        name: 'suggestion',
                        description: "La suggestion que vous souhaitez faire",
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'approuver',
                type: 'SUB_COMMAND',
                description: "Approuve une suggestion",
                options: [
                    {
                        name: 'identifiant',
                        description: 'Identifiant de la suggestion',
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                name: 'désapprouver',
                type: 'SUB_COMMAND',
                description: "Désapprouve une suggestion",
                options: [
                    {
                        name: 'identifiant',
                        description: 'Identifiant de la suggestion',
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                name: 'terminer',
                type: 'SUB_COMMAND',
                description: "Termine une suggestion et affiche le résultat",
                options: [
                    {
                        name: 'identifiant',
                        description: "Identifiant de la suggestion",
                        type: 'INTEGER',
                        required: true
                    }
                ]
            },
            {
                name: 'supprimer',
                type: 'SUB_COMMAND',
                description: "Supprime une suggestion",
                options: [
                    {
                        name: 'identifiant',
                        description: 'Identifiant de la suggestion à supprimer',
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
    run: async(interaction) => {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        interaction.client.db.query(`SELECT * FROM suggestions WHERE guild_id='${interaction.guild.id}'`, (error, all) => {
            if (error) {
                functions.sendError(error, '/suggestion', interaction.user);
                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                return;
            };
            interaction.client.db.query(`SELECT suggest_channel FROM configs WHERE guild_id="${interaction.guild.id}"`, async(err, req) => {
                const request = all.filter(x => x.guild_id === interaction.guild.id);
                const lastId = all[all.length - 1]?.id ?? 0;
    
                const buildButtons = (approves, rejects) => {
                    let a = (approves ?? 0).toString();
                    let r = (rejects ?? 0).toString();
    
                    return new Discord.MessageActionRow()
                        .setComponents(
                            new Discord.MessageButton({ label: `${a} approbation${a != 1 ? 's':''}`, customId: 'suggest-approves', disabled: true, style: 'SUCCESS' }) ,
                            new Discord.MessageButton({ label: `${r} rejet${r != 1 ? 's':''}`, customId: 'suggest-rejects', disabled: true, style: 'DANGER' })
                        );
                };
                
                const channel = interaction.guild.channels.cache.get(req[0]?.suggest_channel);
                if (subcommand === 'suggérer') {
                    if (err) {
                        functions.sendError(err, '/suggestion suggérer', interaction.user);
                        interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                        return;
                    };
                    if (!channel) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Salon invalide")
                        .setDescription(`Le salon des suggestions n'est pas définit.\nUtilisez la commande \`/config\` pour le configurer`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});
                    let suggestion = interaction.options.getString('suggestion');
                    if (suggestion.length > 500) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setDescription("Vous ne pouvez pas proposer des suggestions de plus de **500 caractères**")
                        .setColor('#ff0000')
                        .setTitle("Suggestion trop longue")
                    ] }).catch(() => {});
                    suggestion = suggestion.replace(/"/g, '\\"');
    
                    let similar;
                    if (request.length > 0) {
                        similar = findBestMatch(suggestion, request.map(x => x.suggestion.replace(/\\\\'/g, '"')));
                    };
                    
                    const embed = package.embeds.classic(interaction.user)
                        .setTitle("Suggestion")
                        .setDescription(`${suggestion.replace(/\\\\g/g, '"')}${similar?.bestMatch?.rating > 0.4 ? '\n\n**Suggestion similaire**\n' + similar.bestMatch.target : ''}\n\n> Identifiant : \`${lastId + 1}\``)
                        .setColor('BLUE')
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setFooter({ text: `Utilisez la commande /suggestion pour approuver/rejeter cette suggestion` })
    
                    const suggest = await channel.send({ embeds: [ embed ], components: [ buildButtons() ] }).catch(() => {});
                    if (!suggest) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Erreur")
                        .setDescription(`La suggestion n'a pas été envoyée.\nVérifiez mes permissions puis réessayez`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});
    
                    interaction.client.db.query(`INSERT INTO suggestions (suggestion, user_id, channel_id, message_id, guild_id, sended_at) VALUES ("${suggestion}", "${interaction.user.id}", "${channel.id}", "${suggest.id}", "${interaction.guild.id}", "${Date.now()}")`, (e, r) => {
                        if (e) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                            .setTitle("Erreur")
                            .setDescription(`La suggestion n'a pas été envoyée.\nVérifiez mes permissions puis réessayez`)
                            .setColor('#ff0000')
                        ] }).catch(() => {});
                    })
    
                    return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Suggestion envoyée")
                        .setDescription(`Votre [suggestion](${suggest.url}) a été envoyée`)
                        .setColor('ORANGE')
                    ] }).catch(() => {});
                };
                const suggestId = interaction.options.get('identifiant').value;
                const suggestion = request.find(x => x.id === suggestId);
                const suggestMsg = await channel.messages.fetch(suggestion.message_id);

                if (!suggestMsg) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Erreur")
                    .setDescription(`Je ne trouve plus le message de cette suggestion`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
    
                if (!suggestion) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Suggestion inexistante")
                    .setDescription(`Cette suggestion n'existe pas`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
    
                if (subcommand === 'approuver' || subcommand === 'désapprouver') {
                    if (suggestion.ended === '1') return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Suggestion terminée")
                        .setDescription(`Vous ne pouvez pas voter pour une suggestion terminée`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});

                    let votes = JSON.parse(suggestion.votes);
                    if (votes.includes(interaction.user.id)) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Déjà voté")
                        .setDescription(`Vous avez déjà voté pour cette suggestion`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});

                    votes.push(interaction.user.id);
                    votes = JSON.stringify(votes);
                    let sqlVar = '';
                    let actionVar = '';
                    
                    if (subcommand === 'désapprouver') {
                        sqlVar = `rejects='${parseInt(suggestion.rejects) + 1}'`;
                        actionVar = 'désapprouvé';
                    } else {
                        sqlVar = `approves='${parseInt(suggestion.approves + 1)}'`;
                        actionVar = 'approuvé';
                    };

                    interaction.client.db.query(`UPDATE suggestions SET ${sqlVar}, votes='${votes}'`, (e, r) => {
                        if (e) {
                            functions.sendError(e, 'suggestion', interaction.user);
                            interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                            return;
                        };

                        interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                            .setTitle("Vote")
                            .setDescription(`Vous avez **${actionVar}** [cette suggestion](${suggestMsg.url})`)
                            .setColor(actionVar === 'approuvé' ? '#00ff00' : '#ff0000')
                        ] }).catch(() => {});
                        let { rejects, approves } = suggestion;
                        if (subcommand === 'approuver') approves++
                        else rejects++;

                        suggestMsg.edit({ components: [ buildButtons(parseInt(approves), parseInt(rejects)) ] }).catch(console.log);
                    });
                    return;
                };
                if (subcommand === 'terminer') {
                    if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.editReply({ embeds: [ package.embeds.missingPermission(interaction.user, 'gérer le serveur') ] }).catch(() => {});

                    if (suggestion.ended === '1') return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Suggestion terminée")
                        .setDescription(`Vous ne pouvez pas terminer une suggestion déjà terminée`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});

                    let { rejects, approves } = suggestion;
                    rejects = parseInt(rejects);
                    approves = parseInt(approves);

                    /**
                     * @param {{ content: String, color: String }} data 
                     */
                    const end = (data) => {
                        
                    }
                }
            });
        });
    }
}
