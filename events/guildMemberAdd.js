const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: "guildMemberAdd",
    /**
     * @param {Discord.GuildMember} member 
     */
    execute: (member) => {
        const guild = member.guild;
        const client = guild.client;

        const check = (enabled) => {
            if (!enabled) return;

            const banned = require('../assets/data/gbanned.json');
            if (banned.includes(member.id)) {
                member.send({ content: `Vous avez été expulsé de ${member.guild.name} car vous êtes GBan.` }).catch(() => {});

                member.kick().catch(() => {});
                functions.log(member.guild, package.embeds.classic(member.guild.me)
                    .setTitle("GBan")
                    .setDescription(`${member.user.tag} a été expulé du serveur car il est GBanni.`)
                    .setColor("ORANGE")
                );
            };
        }

        const addRoles = () => {
            client.db.query(`SELECT role_id FROM roles_start WHERE guild_id="${guild.id}"`, (err, req) => {
                if (err) {
                    functions.sendError(err, 'query fetch at roles start', member.user);
                    return;
                };
                (async() => {await guild.roles.fetch();})();
                const roles = guild.roles.cache.filter(x => x.id !== guild.id && req.some(x => x.role_id==x.id));
                if (roles.size == 0) return;

                member.roles.add(roles).catch(() => {});
            });
        };
        client.db.query(`SELECT join_enable, join_channel, join_message, gban_enable, roles_enable FROM configs WHERE guild_id="${guild.id}"`, (err, req) => {
            if (err) return console.log(err);

            const data = req[0];
            if (!data) return check(true);

            if (data.roles_enable == "1") addRoles();

            if (data.join_enable == "0") return;
            check(data.gban_enable == '1');

            const channel = guild.channels.cache.get(data.join_channel);
            if (!channel) return;

            let msg = data.join_message;
            if (!msg) {
                const list = [
                    "{user.mention} a bondi dans le serveur.",
                    "{user.mention} a rejoint le groupe.",
                    "{user.mention} vient de se glisser dans le serveur.",
                    "Youhou, tu as réussi, {user.mention} !",
                    "C'est un plaisir de te voir, {user.mention}.",
                    "{user.mention} vient juste d'arriver.",
                    "Salut {user.mention}, on espère que tu as apporté de la pizza !"
                ];

                msg = list[Math.floor(Math.random() * list.length)]
            };

            const replace = (x, y) => {
                msg = msg.replace(x, y);
            };

            const regexes = [
                {x: /{user.name}/g, y: member.user.username},
                {x: /{user.tag}/g, y: member.user.discriminator},
                {x: /{user.id}/g, y:member.id},
                {x: /{guild.name}/g, y: guild.name},
                {x: /{guild.count}/g, y: guild.members.cache.size},
                {x: /{user.mention}/g, y: `<@${member.id}>`}
            ];

            regexes.forEach((x) => {
                replace(x.x, x.y);
            });

            channel.send({ content: msg }).catch(() => {});
        });

        const moment = require('moment');
        moment.locale('fr');

        functions.log(guild, package.embeds.classic(member.user)
            .setTitle("Nouveau membre")
            .setDescription(`<@${member.id}> vient d'arriver.\n\nSon compte a été crée ${moment(member.user.createdTimestamp).fromNow()}`)
            .setColor('GREEN')
            .setThumbnail(member.user.avatarURL({ dynamic: false, format: 'png' }))
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) || member.user.avatarURL({ dynamic: true }) })
        );
    }
};