const functions = require('../assets/functions');
const package = functions.package();
const { CommandInteraction } = require('discord.js');

module.exports = {
    configs: {
        name: 'demineur',
        description: "Lance une partie de démineur",
        options: [
            {
                name: 'discret',
                description: "Fait en sorte que seul vous coie ce message",
                required: false,
                autocomplete: false,
                type: 'BOOLEAN'
            }
        ]
    },
    /**
     * @param {CommandInteraction} interaction 
     */
    run: (interaction) => {
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
            
            counter += +(hasTop && hasLeft && cases[x - 1][y - 1].mined);
            counter += +(hasTop && cases[x - 1][y].mined);

            counter += +(hasTop && hasRight && cases[x - 1][y + 1].mined);
            counter += +(hasLeft && cases[x][y - 1].mined);

            counter += +(hasRight && cases[x][y + 1].mined);
            counter += +(hasBottom && hasLeft && cases[x + 1][y - 1].mined);

            counter += +(hasBottom && cases[x + 1][y].mined);
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

        const ephemeral = interaction.options.get('discret') ? interaction.options.get('discret').value : false;
        interaction.reply({ content: content, ephemeral: ephemeral });
    }
}