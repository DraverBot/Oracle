const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: 'interactionCreate',
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    execute: (interaction) => {
        if (!interaction.isCommand()) return;
        let cmd = package.commands.get(interaction.commandName);

        if (cmd.help.dm == false && !interaction.guild) return
    }
}