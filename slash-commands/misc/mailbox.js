const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dm: true,
        dev: false,
        systems:[],
        permissions:[]
    },
    configs: {
        name: "mailbox",
        description: "Ouvre votre boite mail"
    },
    run: (interaction) => {
        interaction.client.MailsManager.mailbox(interaction.user, 'none', interaction);
    }
}