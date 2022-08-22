const { Client, EmbedBuilder, Interaction } = require('discord.js');
const { connect, beta, connectYeikzy, default_prefix } = require('../assets/data/data.json');
const commands = require('../assets/data/slashCommands');
const fs = require('fs');
const { privateSlashCommandsBuilder, capitalize, stickyRoles } = require('../assets/functions');
const cooldowns = require('../assets/data/collects').specificCooldowns;

module.exports = {
    event: 'ready',
    /**
     * @param {Client} client 
     */
    execute: (client) => {
        console.log('Ready !');

        const slashCommandsBuilder = () => {
            privateSlashCommandsBuilder(client);

            fs.readdirSync('./slash-commands').forEach((dir) => {
                fs.readdirSync(`./slash-commands/${dir}`).filter((x) => x.endsWith('.js')).forEach((fileName) => {
                    const file = require(`../slash-commands/${dir}/${fileName}`);

                    if (commands.has(file.configs.name)) throw `command ${file.configs.name} already exists`;
    
                    if (file.guild) {
                        client.application.commands.create(file.configs, file.guild).catch((e) => console.log(e));
                    } else {                    
                        client.application.commands.create(file.configs).catch((e) => console.log(e));
                    };
    
                    if (!file.help) file.help = { dm: false, dev: false, permissions: [], systems:[], cd: 5 };
                    file.help.category = dir;

                    commands.set(file.configs.name, file);
                });

            })
        };
        const loadSpecificsCooldowns = () => {
            client.db.query(`SELECT * FROM cooldowns WHERE date > "${Date.now()}"`, (err, req) => {
                if (err) throw err;

                for (const cd of req) {
                    const dataset = cd;
                    dataset.command = `${dataset.command}`;

                    cooldowns.set(`${dataset.user_id}.${dataset.command}`, dataset);
                }
            })
        };
        const managerBuilder = () => {
            fs.readdirSync('./assets/managers').filter(x => x.endsWith('.js')).forEach((managerFileName) => {
                const file = require(`../assets/managers/${managerFileName}`);

                const managerName = capitalize(managerFileName.split('.')[0]);
                const manager = file;
                
                client[managerName] = new manager(client, client.db);
                client[managerName].init();
            });
        };

        slashCommandsBuilder();
        managerBuilder();
        loadSpecificsCooldowns();
        stickyRoles.load(client)

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
    
                const embed = new EmbedBuilder()
                    .setTitle("Reconnexion")
                    .setDescription(`Je viens de me reconnecter`)
                    .setColor("ORANGE")
                    .setTimestamp()
    
                web.send({ embeds: [ embed ] }).catch(() => {});
            });
            client.fetchWebhook(connectYeikzy.id, connectYeikzy.token).then((web) => {
                if (!web) return;
    
                const embed = new EmbedBuilder()
                    .setTitle("Reconnexion")
                    .setDescription(`Je viens de me reconnecter`)
                    .setColor("ORANGE")
                    .setTimestamp()
    
                web.send({ embeds: [ embed ] }).catch(() => {});
            })
        };

        let statusIndex = 0;
        let status = [
            {name: 'la version ' + require('../assets/data/data.json').version, type: 'WATCHING'},
            {name: `%users% utilisateurs`, type: 'LISTENING'},
            {name: `%servers% serveurs`, type: 'WATCHING'},
            {name: "Passage en slash commandes !", type: 'WATCHING'},
            {name: "Mentionnez moi pour des informations", type: 'WATCHING'},
            {name: "%members% membres", type: 'WATCHING'},
            {name: 'une vidéo', type: 'STREAMING', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'},
            {name: "ma page top.gg", type: 'WATCHING'}
        ];
        
        setInterval(() => {
            statusIndex++;
            if (statusIndex > status.length) statusIndex = 0;

            let statut = status[statusIndex];
            if (!statut) {
                statusIndex = 0;
                statut = status[statusIndex];
            };
            
            statut.name = statut.name
                .replace('%users%', client.users.cache.size)
                .replace('%servers%', client.guilds.cache.size);
            
            if (statut.name.includes('%members%')) {
                (async() => {await client.guilds.fetch()});
                let members = client.guilds.cache.map(x => x.memberCount).reduce((a, b) => a + b);

                statut.name = statut.name.replace('%members%', members);
            };

            client.user.setActivity(statut);
        }, 20000);
    }
};