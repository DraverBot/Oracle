const Discord = require('discord.js');
const functions = require('../assets/functions');
const package = functions.package();

module.exports = {
    event: "guildMemberRemove",
    /**
     * @param {Discord.GuildMember} member 
     */
    execute: (member) => {
        const guild = member.guild;
        const client = guild.client;

        client.db.query(`SELECT leave_enable, leave_channel, leave_message FROM configs WHERE guild_id="${guild.id}"`, (err, req) => {
            if (err) return console.log(err);

            const data = req[0];
            if (!data) return;

            if (data.leave_enable) return;

            const channel = guild.channels.cache.get(data.leave_channel);
            if (!channel) return;

            let msg = data.leave_message;
            if (!msg) return;

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
            .setTitle("Membre partit")
            .setDescription(`<@${member.id}> vient de partir.\n\nAvait rejoint ${moment(member.joinedTimestamp).fromNow()}`)
            .setColor('#ff0000')
            .setThumbnail(member.user.avatarURL({ dynamic: false, format: 'png' }))
            .setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true }) || member.user.avatarURL({ dynamic: true }) })
        );
    }
};