const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'demineur',
    description: "Lance une partie de démineur sur Discord",
    aliases: ['minesweeper'],
    permissions: [],
    cooldown: 5,
    private: false,
    dm: true
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args) => {
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

    functions.lineReply(message.id, message.channel, content);
}