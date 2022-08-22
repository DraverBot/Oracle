const Discord = require('discord.js');
const functions = require('./functions');
const pack = functions.package();

class Morpion {
    /**
     * @param {Discord.NonThreadGuildBasedChannel} channel 
     * @param {Discord.USer} user 
     * @param {?Discord.CommandInteraction} interaction
     */
    constructor(channel, user, interaction) {
        this.channel = channel;
        this.user = user;
        this.matrix =  new Array(9);
        this.neutral = '⬛';
        this.user_piece = '❌';
        this.bot_piece = '⭕';
        this.tourPlay = 'user';
        this.winner = null;
        this.ended = false;
        this.interaction = interaction;
    }
    end() {
        this.ended = true;
    }
    generateCancelContent() {
        const embed = this.generateEmbed()
            .setTitle("Abandon")
            .setColor('RED')
            .spliceFields(0, 1)
            .addField('Abandon', "Vous avez abandonné", false)

        return { embeds: [ embed ], components: [] };
    }
    generateEmbed() {
        let plate = '';
        for (let i = 0; i< 9;i++) {
            
            if (!(i / 3).toString().includes('.')) plate+="\n";
            if (this.matrix[i] === this.neutral) {
                plate+=functions.getNumbersEmoji()[i + 1];
            } else {
                plate+=this.matrix[i];
            }
            plate+=`|`;
        };

        const embed = pack.embeds.classic(this.user)
            .setTitle('Morpion')
            .setDescription(plate)
            .setColor('ORANGE')
            .addField('Tour', (this.tourPlay === 'user' ? "À **vous**" : "À **moi**") + ' de jouer', false)

        return embed;
    }
    generateButtons() {
        let first = new Discord.ActionRowBuilder();
        let second = new Discord.ActionRowBuilder();

        for (let i = 0;i<9;i++) {
            const btn = new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setLabel(`Case ${i + 1}`)
                .setCustomId(i.toString())

            if (this.matrix[i] !== this.neutral) btn.setDisabled(true);
            if (i <= 4) first.addComponents(btn);
            else second.addComponents(btn);
        };

        second.addComponents(
            new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setLabel('Abandonner')
                .setCustomId('cancel')
        );
        return [first, second];
    }
    generateWinEmbed() {
        let plate = '';
        for (let i = 0; i< 9;i++) {
            if (!(i / 3).toString().includes('.')) plate+="\n";
            if (this.matrix[i] === this.neutral) {
                plate+=functions.getNumbersEmoji()[i + 1];
            } else {
                plate+=this.matrix[i];
            }
            plate+=`|`;
        };

        const embed = pack.embeds.classic(this.user)
            .setTitle('Morpion')
            .setDescription(plate)
        
        if (this.winner === 'user') {
            embed.setColor('GREEN')
            .addField("Victoire", "Vous avez gagné !", false);
        } else if (this.winner === 'bot') {
            embed.setColor('ORANGE')
            .addField('Défaite', "Vous avez perdu", false);
        } else {
            embed.setColor('DARK_ORANGE')
            .addField('Égalité', "Nous avons fait égalité !", false);
        };

        return embed;
    }
    returnEmbed() {
        if (!this.ended) {
            return this.generateEmbed();
        } else return this.generateWinEmbed();
    }
    generateComponent() {
        if (!this.ended) {
            return this.generateButtons();
        } else return [];
    }
    generateContent() {
        return { embeds: [ this.returnEmbed() ], components: this.generateComponent()};
    }
    init() {
        this.matrix.fill(this.neutral);
    }
    check() {
        let winner;
        const toCheck = [
            [0, 1, 2], [0, 3, 6], [0,4,8],
            [3,4,5],[1,4,7],[2,4,6],
            [6,7,8],[2,5,8]
        ];

        toCheck.forEach((check) => {
            let state = this.matrix[check[0]];
            let isValid = true;
            check.forEach((x) => {
                if (this.matrix[x] !== state) isValid = false;
                if (this.matrix[x] === this.neutral) isValid = false;
            });

            if (isValid) {
                winner = state == this.user_piece ? 'user' : 'bot';
                this.winner = winner;
            };
        });

        return winner;
    }
    placePiece(player, place) {
        this.matrix[place] = this[`${player}_piece`];
        return this.matrix[place];
    }
    play() {
        let choosen;
        const lignes = [];
        const numbers = "012 120 345 453 678 786 036 147 258 360 471 582 048 246 642 840 175 354 084 021 354 087 063 285 048 687 084";

        const arrays = numbers.split(' ');
        arrays.forEach((x) => {
            let array = [x[0], x[1], x[2]];
            lignes.push(array);
        });

        lignes.forEach((x) => {
            if (this.matrix[x[2]] !== this.neutral) {
                const index = lignes.indexOf(x);
                lignes.splice(index, 1);
            };
        });

        lignes.forEach((cases) => {
            let state = this.matrix[cases[0]];
            if (this.matrix[cases[2]] !== this.neutral) return;
            if (this.matrix[cases[1]] === state && state === this.bot_piece) choosen = cases[2];
        });
        if (!choosen) {
            lignes.forEach((cases) => {
                let state = this.matrix[cases[0]];
                if (this.matrix[cases[2]] !== this.neutral) return;
                if (this.matrix[cases[1]] === state && state === this.user_piece) choosen = cases[2];
            });
        };
        if (!choosen) {
            const props = [0,2,4,6,8].filter(x => this.matrix[x] === this.neutral);
            if (props.length > 0) {
                choosen = props[functions.random(props.length, 0)];
            } else {
                const subs = [1,3,5,7].filter(x => this.matrix[x] === this.neutral);
                if (subs.length > 0) {
                    choosen = subs[functions.random(subs.length, 0)];
                };
            };
        };
        if (!choosen) {
            const poss = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((x) => this.matrix[x] === this.neutral);
            if (poss.length === 0) return;
            choosen = poss[functions.random(poss.length, 0)];
        }
        return choosen;
    }
    async start() {
        this.init();
        const sent = await this.send();
        const collector = sent.createMessageComponentCollector({ filter: x => x.user.id === this.user.id, time: 60*1000*10 });

        collector.on('collect', /** @param {Discord.ButtonInteraction} interaction */ (interaction) => {
            if (interaction.customId === 'cancel') return collector.stop('cancel') & this.end() & interaction.deferUpdate();
            if (this.tourPlay === 'bot') return interaction.reply({ content: `Ce n'est pas à vous de jouer` }).then(() => setTimeout(() => {interaction.deleteReply()}, 5000));

            interaction.deferUpdate();

            this.tourPlay='bot';
            this.placePiece('user', parseInt(interaction.customId));

            sent.edit(this.generateContent());
            if (this.check()) return collector.stop('ended') & this.end();

            const play = this.play();
            setTimeout(() => {
                if (!play) {
                    collector.stop('tie');
                    this.end();
                    return;
                };
                
                this.placePiece('bot', play);
                this.tourPlay = 'user';
                sent.edit(this.generateContent());

                if(this.check()) return collector.stop('ended');
                if (this.matrix.filter(x => x === this.neutral).length === 0) {
                    collector.stop('tie');
                    this.end();
                    return;
                }
            }, 2000);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'cancel') return sent.edit(this.generateCancelContent());
            if (reason === 'tie') {
                sent.edit({ embeds: [ this.generateWinEmbed() ], components: [] });
                return;
            };
            if (reason === 'ended') {
                sent.edit({ embeds: [ this.generateWinEmbed() ], components: [] });
                return;
            };

            sent.edit({ embeds: [ pack.embeds.collectorNoMessage(this.user) ], components: [] }).catch(() => {});
        });
    }
    async send() {
        if (this.interaction) {
            await this.interaction.reply(this.generateContent());
            return await this.interaction.fetchReply();
        } else {
            return await this.channel.send(this.generateContent());
        }
    }
}

module.exports = Morpion;