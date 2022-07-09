const Discord = require('discord.js');
const Morpion = require('../../assets/morpion');

module.exports = {
    help: {
        name: 'morpion',
        description: "Joue au morpion",
        aliases: ['tictactoe', "tic-tac-toe"],
        permissions: [],
        private: false,
        dm: false,
        cooldown: 10
    },
    run: (message) => {
        const morpion = new Morpion(message.channel, message.author);
        morpion.start();
    }
}