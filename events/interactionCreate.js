const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package()
const commands = require('../assets/data/slashCommands');
const { cooldowns } = require('../assets/data/collects');

module.exports = {
    event: 'interactionCreate',
    /**
     * @param {Discord.Interaction} interaction 
     */
    execute: (interaction) => {
        if (interaction.isCommand()) {
            let cmd = commands.get(interaction.commandName);
            if (!cmd && interaction.guild) {
                cmd = commands.get(`${interaction.guild.id}-${interaction.commandName}`);
            };
            if (!cmd) return /*interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Erreur")
                .setDescription(`Je n'ai pas trouvé cette commande parmi mes commandes.\nVeuillez patienter un peu.\n\n:bulb:\n> Si l'erreur persiste, contactez [mes développeurs](${require('../assets/data/data.json').support})`)
                .setColor('ORANGE')
            ], ephemeral: true });*/

            if (cmd.guild) {
                const file = require(`../private-slash-commands/${interaction.guild.id}-${interaction.commandName}.js`);

                const run = new Promise((resolve) => resolve(cmd.run(interaction)));
                run.catch((error) => {
                    console.log(error);
                    functions.sendError(error, interaction.commandName, interaction.user);
    
                    if (!interaction.replied) interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande` })
                    else interaction.editReply({ content: `Une erreur s'est produite lors de l'exécution de la commande`, embeds: [], components: [] });
                })
                return;
            };
            if (cmd.help.dm == false && !interaction.guild) {
                return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Commande inexecutable")
                    .setDescription(`Cette commande n'est pas exécutable en messages privés`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
            };
            if (cmd.help.private == true && ![package.configs.gs, package.configs.yz].includes(interaction.user.id)) {
                return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Commande de développeur")
                    .setDescription(`Cette comamnde est réservée à mes développeurs`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
            };
            const cdCode = `${interaction.user}.${interaction.commandName}`;
            if (cooldowns.has(cdCode)) {
                return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Cooldown")
                    .setDescription(`Ola ! Mollo l'asticot ! Vous avez un cooldown sur cette commande.\nRéessayez <t:${(cooldowns.get(cdCode) / 1000).toFixed(0)}:R>`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
            } else {
                cooldowns.set(cdCode, Date.now() + ((cmd.help.cd ? cmd.help.cd : 5) * 1000));

                setTimeout(() => {
                    cooldowns.delete(cdCode);
                }, (cmd.help.cd ? cmd.help.cd : 5) * 1000);
            };
            if (cmd.help.sCd) {
                const sCd = cmd.help.sCd;

                if (functions.cooldowns.has(interaction.user.id, sCd.code)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Cooldown")
                    .setDescription(`Vous avez un cooldown sur cette commande.\nRéessayez <t:${(functions.cooldowns.getTime(interaction.user.id, sCd.code) / 1000).toFixed(0)}:R>`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
                else {
                    functions.cooldowns.set({ userId: interaction.user.id, commandName: sCd.code, time: Date.now() + (sCd.time * 1000), client: interaction.client, isSlash: false })
                }
            }
            if (cmd.help.permissions && cmd.help.permissions.length > 0 && interaction.guild) {
                let missing = [];
                for (const perm of cmd.help.permissions) {
                    if (!interaction.member.permissions.has(perm.toUpperCase())) missing.push(perm.toUpperCase());
                };

                if (missing.length > 0) {
                    return interaction.reply({ embeds: [ package.embeds.missingPermission(interaction.user, missing.map((x) => package.perms[x]).join(', ')) ] }).catch(() => {});
                }
            };
            const runCmd = () => {
                const run = new Promise((resolve) => resolve(cmd.run(interaction)));
                run.catch((error) => {
                    console.log(error);
                    functions.sendError(error, interaction.commandName, interaction.user);
    
                    if (!interaction.replied) interaction.reply({ content: `Une erreur s'est produite lors de l'exécution de la commande` }).catch(() => {});
                    else interaction.editReply({ content: `Une erreur s'est produite lors de l'exécution de la commande`, embeds: [], components: [] }).catch(() => {});
                });
            };
            if (cmd.help.systems && cmd.help.systems.length > 0 && interaction.guild) {
                interaction.client.db.query(`SELECT ${cmd.help.systems.map(x => x.value).join(', ')} FROM configs WHERE guild_id="${interaction.guild.id}"`, (err, req) => {
                    if (err) {
                        console.log(error);
                        functions.sendError(error, interaction.commandName, interaction.user);
        
                        interaction.reply({ embeds: [ package.embeds.errorSQL(interaction.user) ] }).catch(() => {});
                    };

                    if (req.length == 0) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Erreur")
                        .setDescription(`Une erreur est survenue lors de l'exécution de la commande.\nPour la résoudre, vous devez me réinviter sur votre serveur.\n> Si ce message s'affiche toujours, contactez mes développeurs.`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});
                    
                    let missing = [];
                    Object.keys(req[0]).forEach((key) => {
                        if ((req[0][key] == "0" ? false : true) !== cmd.help.systems.find(x => x.value == key).state) missing.push(cmd.help.systems.find(x => x.value == key));
                    });

                    if (missing.length > 0) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Système perturbateur")
                        .setDescription(`Vous ne pouvez pas exécuter cette commande car des systèmes sont activés (ou désactivés) sur votre serveur :\n\n${missing.map((sys) => `Le système ${sys.name} est ${sys.state == true ? "désactivé" : "activé"}`).join('\n')}`)
                        .setColor('#ff0000')
                    ] }).catch(() => {});

                    runCmd();
                })
            } else {
                runCmd();
            }
        }
    }
};