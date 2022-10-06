const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const blagueAPI = require('blagues-api');

const blagues = new blagueAPI(package.configs['blagues-api-token']);

module.exports = {
    help: {
        dm: true,
        dev: false,
        permissions: [],
        systems: [],
        cd: 5
    },
    configs: {
        name: 'blague',
        description: "Affiche une blague aléatoire",
        options: Object.keys(blagues.categories).map((x) => ({name: x.toLowerCase(), description: `Blague de type ${x.toLowerCase()}`, type: 'SUB_COMMAND'})).concat({ name: 'config', description: "Configure les blagues autorisées sur Oracle", type: 'SUB_COMMAND' })
    },
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    run: async(interaction) => {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'config') {
            if (!interaction.guild) return interaction.editReply({ embeds: [ 
                package.embeds.classic(interaction.user)
                    .setTitle("Commande inexecutable")
                    .setDescription(`Cette commande n'est pas exécutable en messages privés`)
                    .setColor('#ff0000')
            ] }).catch(() => {});
            if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.editReply({ embeds: [ package.embeds.missingPermission(interaction.user, 'gérer le serveur') ] }).catch(() => {});

            const first = [];
            Object.keys(blagues.categories).forEach((x) => {
                first.push(new Discord.MessageButton()
                    .setLabel(x.toLowerCase())
                    .setStyle('PRIMARY')
                    .setCustomId(x)
                );
            });
            const cancel = new Discord.MessageButton()
                .setLabel('Annuler')
                .setCustomId('cancel')
                .setStyle('DANGER')

            first.push(cancel);
            const second = first.splice(5, 2);

            const reply = await interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Configuration")
                .setDescription(`Quel type de blagues voulez-vous configurer ?`)
                .setColor('YELLOW')
            ], components: [ new Discord.MessageActionRow({ components: first }), new Discord.MessageActionRow({ components: second }) ] });

            let type;
            const collector = reply.createMessageComponentCollector({ filter: x => x.user.id === interaction.user.id, time: 120000 });
        
            collector.on('collect', /**@param {Discord.ButtonInteraction} inter */ (inter) => {
                if (inter.customId === 'cancel') {
                    collector.stop('cancel');
                    return interaction.editReply({ components: [], embeds: [ package.embeds.cancel() ] }).catch(() => {});
                };

                if (!type) {
                    type = inter.customId;
                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Activation")
                        .setDescription(`Voulez-vous activer ou désactiver la catégorie **${type.toLowerCase()}** ?`)
                        .setColor('YELLOW')
                    ], components: [ new Discord.MessageActionRow({ components: [
                        new Discord.MessageButton({ label: 'Activer', style: 'SUCCESS', customId: 'enable' }),
                        new Discord.MessageButton({ label: 'Désactiver', style: 'DANGER', customId: 'disable' }),
                        cancel
                    ] }) ] }).catch(() => {});
                    inter.deferUpdate();
                } else {
                    const state = inter.customId === 'enable';
                    interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle(state ? 'Activé' : 'Désactivé')
                        .setDescription(`La catégorie **${type.toLowerCase()}** a été ${state ? 'activée' : 'désactivée'}`)
                        .setColor('#00ff00')
                    ], components: [] }).catch(() => {});
                    interaction.client.db.query(`SELECT data FROM jokes WHERE guild_id='${interaction?.guild?.id}'`, async(error, request) => {
                        if (error) {
                            interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                            functions.sendError(error, '/blague config', interaction.user);
                            return;
                        };
            
                        let hasState = !(request.length === 0);
                        const data = JSON.parse(request[0]?.data ?? '{"global": true, "dark": false, "dev": true, "limit": false, "beauf": true, "blondes": true}');
                        data[type.toLowerCase()] = state;

                        let sql = hasState ? `UPDATE jokes SET data='${JSON.stringify(data)}' WHERE guild_id='${interaction.guild.id}'` : `INSERT INTO jokes (guild_id, data) VALUES ('${interaction.guild.id}', '${JSON.stringify(data)}')`;
                        interaction.client.db.query(sql, (er) => {
                            if (er) {
                                interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                                functions.sendError(er, '/blague config', interaction.user);
                                return;
                            };  
                        })
                    });
                    collector.stop('ended');
                }
            });

            collector.on('end', (_collected, reason) => {
                if (reason === 'cancel' || reason === 'ended') return;
                interaction.editReply({ components: [], embeds: [ package.embeds.cancel() ] }).catch(() => {});
            })
        } else {
            interaction.client.db.query(`SELECT data FROM jokes WHERE guild_id='${interaction?.guild?.id}'`, async(error, request) => {
                if (error) {
                    interaction.editReply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    functions.sendError(error, '/blague', interaction.user);
                    return;
                };
    
                const data = JSON.parse(request[0]?.data ?? '{"global": true, "dark": false, "dev": true, "limit": false, "beauf": true, "blondes": true}');
                const type = subcommand.toUpperCase();
    
                if (!data[type.toLowerCase()]) return interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("🚫 Blague interdite")
                    .setDescription(`Cette catégorie de blague n'est pas autorisée.\nUtilisez la sous-commande \`config\` pour configurer les blagues autorisées`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
                
                const blague = await blagues.randomCategorized(blagues.categories[type]);
                const embed = package.embeds.classic(interaction.user)
                    .setTitle(blague.joke)
                    .setDescription(`||${blague.answer}||`)
                    .setColor("ORANGE")
                    .setAuthor({ name: `Service blagues-api`, iconURL: interaction.client.user.displayAvatarURL() });
                
                interaction.editReply({ embeds: [ embed ] });
            });
        }
    }
}