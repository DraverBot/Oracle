const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'game',
        description: "Joue a des jeux sur Oracle",
        options: [
            {
                name: 'démineur',
                description: "Joue au démineur sur Oracle",
                type: 'SUB_COMMAND'
            },
            {
                name: 'number',
                description: "Joue à guess the number",
                type: 'SUB_COMMAND_GROUP',
                options: [
                    {
                        name: 'multijoueur',
                        description: "Joue en multijoueur",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'max',
                                description: "Nombre maximum",
                                type: 'INTEGER',
                                required: false
                            },
                            {
                                name: 'min',
                                description: "Nombre minimum",
                                type: 'INTEGER',
                                required: false
                            }
                        ]
                    },
                    {
                        name: 'solo',
                        description: "Joue en solo",
                        type: 'SUB_COMMAND',
                        options: [
                            {
                                name: 'max',
                                description: "Nombre maximum",
                                type: 'INTEGER',
                                required: false
                            },
                            {
                                name: 'min',
                                description: "Nombre minimum",
                                type: 'INTEGER',
                                required: false
                            }
                        ]
                    }
                ]
            },
            {
                name: 'morpion',
                description: "Joue au morpion contre Oracle",
                type: 'SUB_COMMAND'
            },
            {
                name: 'roulette-russe',
                description: "Joue à la roulette russe",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'expulsion',
                        description: "⚠ Si vous perdez vous serez expulsé.",
                        required: false,
                        type: 'BOOLEAN'
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        let game = interaction.options.getSubcommand();
        
        if (game == 'démineur') {
            var cases = {};
            
            for (let x = 0; x < 10; x++) {
                cases[x] = {};
        
                for (let y = 0; y < 10; y++) {
                    cases[x][y] = {
                        mined: false,
                        value: 0
                    };
                };
            };
        
            let numberOfMines = functions.random(5, 10);
            for (let i = 0; i < numberOfMines; i++) {
                const x = functions.random(9);
                const y = functions.random(9);
        
                cases[x][y].mined = true;
            };
        
            const getNumberOfMines = (xx, yy) => {
                const x = parseInt(xx);
                const y = parseInt(yy);
        
                if (cases[x][y].mined) {
                    return false;
                }
                
                let counter = 0;
                const hasLeft = y > 0;
                const hasRight = y < (9 - 1);
                const hasTop = x > 0;
                const hasBottom = x < (9 - 1);
                // top left
                counter += +(hasTop && hasLeft && cases[x - 1][y - 1].mined);
                // top
                counter += +(hasTop && cases[x - 1][y].mined);
                // top right
                counter += +(hasTop && hasRight && cases[x - 1][y + 1].mined);
                // left
                counter += +(hasLeft && cases[x][y - 1].mined);
                // right
                counter += +(hasRight && cases[x][y + 1].mined);
                // bottom left
                counter += +(hasBottom && hasLeft && cases[x + 1][y - 1].mined);
                // bottom
                counter += +(hasBottom && cases[x + 1][y].mined);
                // bottom right
                counter += +(hasBottom && hasRight && cases[x + 1][y + 1].mined);
                return counter;
            };
        
            Object.keys(cases).forEach((x) => {
                Object.keys(cases[x]).forEach((y) => {
                    const selected = cases[x][y];
                    if (!selected.mined) {
                        cases[x][y].value = getNumberOfMines(x, y);
                    };
                });
            });
        
            let content = '';
            for (let x = 0; x < 10; x++) {
                for (let y = 0; y < 10; y++) {
                    const selected = cases[x][y];
                    if (selected.mined) content+='||:bomb:||'
                    else content+=`||${functions.getNumbersEmoji()[selected.value]}||`;
                };
        
                content+= '\n'
            };

            interaction.reply({ content }).catch(() => {});
        }
        if (game == 'morpion') {
            const Morpion = require('../assets/morpion');
            const morpion = new Morpion(interaction.channel, interaction.user, interaction);

            morpion.start();
        };
        if (game == 'roulette-russe') {
            const embed = package.embeds.classic(interaction.user)
            const kick = interaction.options.get('expulsion')?.value ?? false;
                    
            if (functions.random(6, 0) === functions.random(6, 0)) {
                embed.setTitle('Perdu')
                    .setColor('#ff0000')
                    .setDescription(`Vous avez **perdu** à la roulette russe.${kick ? "\n> Vous serez expulsé <t:" + ((Date.now() + 5000) / 1000).toFixed(0) + ":R>" : ""}`)
                    
                if (kick) {
                    setTimeout(() => {
                        interaction.member.kick().catch(() => {});
                    }, 5000);
                };
            } else {
                embed.setTitle("Gagné")
                    .setColor('#00ff00')
                    .setDescription(`Vous avez **gagné** à la roulette russe.${kick ? "\n> Vous ne serez **pas** expulsé" : ""}`)
            };

            interaction.reply({ embeds: [ embed ] }).catch(() => {});
        };
        if (('multijoueur solo').includes(game)) {
            let max = interaction.options.get('max')?.value ?? 100;
            let min = interaction.options.get('min')?.value ?? 1;
            
            if (max < 0) max = 100;
            if (min < 0) min = 1;
            if (max < min) {
                let oldMax = max;
                max = min;
                min = oldMax;
            };

            const filter = (m) => {
                let n = parseInt(m.content);
                if (isNaN(n)) return false;
                if (n < min) return false;
                if (n > max) return false;

                if (game == 'solo') {
                    if (m.author.id !== interaction.user.id) return false;
                };

                return true;
            };

            const collector = interaction.channel.createMessageCollector({ filter, time: 120000 });
            
            
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Guess the number")
                .setDescription(`J'ai choisi mon nombre aléatoire entre **${min.toLocaleString()}** et **${max.toLocaleString()}**${game == 'solo' ? '' : '\n\n*Partie en mode multijoueur*'}`)
                .setColor(interaction.guild.me.displayHexColor)
            ] });

            const number = functions.random(max, min);
            let count = 0;
            
            collector.on('collect', (message) => {
                count++;
                let num = parseInt(message.content);

                if (num > number) {
                    functions.reply(message, 'Mon nombre est plus petit');
                } else if (num < number) {
                    functions.reply(message, 'Mon nombre est plus grand');
                } else {
                    collector.stop('ended');
                    functions.reply(message, "Bravo, vous avez trouvé mon nombre");
                };

                if (count == 10) return collector.stop('noreason');
            });

            collector.on('end', (collected, reason) => {
                if (reason == 'ended') return;

                interaction.followUp({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Partie terminée")
                    .setDescription(`Personne n'a trouvé mon nombre.\nMon nombre était **${number.toLocaleString()}**`)
                    .setColor('ORANGE')
                ] }).catch(() => {});
            });
        };
    }
};