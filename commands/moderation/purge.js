const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'purge',
        description: "Ban tous les membres GBannis du serveur.",
        permissions: ['ADMINISTRATOR'],
        aliases: ['gban-purge'],
        private: false,
        dm: false,
        cooldown: 5
    },
    /**
     * @param {Discord.Message} message 
     */
    run: async(message) => {
        await message.guild.members.fetch();
        const gbanned = require('../../assets/data/gbanned.json');

        const members = message.guild.members.cache.filter(x => gbanned.includes(x.id));

        if (members.size == 0) return functions.reply(message, `Il n'y a aucun membre GBan sur ${message.guild.name}`);

        members.forEach((member) => {
            member.ban({ reason: 'gbanned' }).catch(() => {});
        });

        functions.reply(message, package.embeds.classic(message.author)
            .setTitle("GBan")
            .setDescription(`${members.size} membre${members.size > 1 ? 's ont été bannis':'a été banni'} :\n${members.map(x => `<@${x.id}>`).join(' ')}`)
            .setColor('ORANGE')
        );
    }
}