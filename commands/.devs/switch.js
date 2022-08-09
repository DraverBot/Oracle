const { Message, Client } = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();
const fs = require('fs');

module.exports = {
    help: {
        name: 'switch',
        description: "Alterne beta/finale",
        aliases: [],
        permissions: [],
        private: true,
        dm: false,
        cooldown: 0
    },
    /**
     * @param {Message} message 
     * @param {Array} args 
     * @param {Client} client 
     */
    run: async(message, args, client) => {
        const data = package.configs;
        data.beta = !package.configs.beta;

        let state = data.beta == false ? 'finale' : 'beta';

        await functions.reply(message, package.embeds.classic(message.author)
            .setTitle("Changement de version")
            .setDescription(`${package.emojis.loading} passage sur la version **${state} ${data.version}**`)
            .setColor('ORANGE')
        );

        fs.writeFileSync(`./assets/data/data.json`, JSON.stringify(data, '', 4));
        setTimeout(() => {
            process.exit();
        }, 500)
    }
}