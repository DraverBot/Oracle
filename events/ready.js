const { Client, MessageEmbed } = require('discord.js');
const { connect, beta } = require('../assets/data/data.json');

module.exports = {
    event: 'ready',
    /**
     * @param {Client} client 
     */
    execute: (client) => {
        console.log('Ready !');

        const slashCommandsBuilder = () => {
            const fs = require('fs');

            fs.readdirSync('./slash-commands').filter((x) => x.endsWith('.js')).forEach((fileName) => {
                const file = require(`../slash-commands/${fileName}`);

                client.application.commands.create({
                    name: file.configs.name,
                    description: file.configs.description,
                    options: file.configs.options,
                    type: 'CHAT_INPUT'
                }).catch((e) => console.log(e));
            });
        };

        slashCommandsBuilder();
        setInterval(slashCommandsBuilder, 600000);

        client.user.setActivity({
            name: 'la version ' + require('../assets/data/data.json').version,
            type: 'WATCHING',
        });

        const dbl = require('dblapi.js');
        client.dbl = new dbl(require('../assets/data/data.json').token, {
            webhookPort: 5000, webhookAuth: 'password'
        }, client);

        client.dbl.webhook.on('vote', vote => {
            const user = client.users.cache.get(vote.user);
            if (!user) return;

            user.send({ embeds: [ require('../assets/embeds').classic(user)
                .setTitle("Vote")
                .setColor("ORANGE")
                .setDescription(`Merci d'avoir voté pour moi !`)
            ] }).catch(() => {});
        });

        if (beta == false) {
            client.fetchWebhook(connect.id, connect.token).then((web) => {
                if (!web) return;
    
                const embed = new MessageEmbed()
                    .setTitle("Reconnexion")
                    .setDescription(`Je viens de me reconnecter`)
                    .setColor("ORANGE")
                    .setTimestamp()
    
                web.send({ embeds: [ embed ] }).catch(() => {});
            })
        }
    }
};