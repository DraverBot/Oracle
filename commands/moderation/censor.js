const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        name: 'censure',
        description: "Censure le pseudo d'un membre",
        aliases: [],
        permissions: ['manage_guild'],
        cooldown: 5,
        private: false,
        dm: false
    },
    /**
     * 
     * @param {Discord.Message} message 
     * @param {Array} args 
     * @param {Discord.Client} client 
     */
    run: async(message, args, client) => {
        await message.guild.members.fetch();
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!member) return message.channel.send(functions.generateLineReplyContent({ embeds: [ package.embeds.noUser(message.author) ] }, message));
        
        const reason = args.slice(1).join(' ');
        if (!reason) return message.channel.send(functions.generateLineReplyContent({ embeds: [ package.embeds.noReason(message.author) ]}, message ));
        if (reason.includes('"')) return message.channel.send(functions.generateLineReplyContent({embeds: [package.embeds.guillement(message.author)]}, message));

        if (!functions.checkAllConditions(message.guild, message.channel, message.member, member)) return;

        const caracts = "0132456798#&@%*:/;,?!§^$*";
        let nickname = "";

        const max = functions.random(16, 8);
        for (let i = 0; i<max;i++) {
            const caract = caracts[functions.random(caracts.length, 0)];
            nickname+=caract;
        };

        const embed = package.embeds.classic(message.author)
            .setTitle("Censure")
            .setColor('#ff0000')
            .addFields(
                {
                    name: "Modérateur",
                    value: `<@${message.author.id}> (${message.author.tag})`,
                    inline: true
                },
                {
                    name: "Membre",
                    value: `<@${member.id}> (${member.user.tag})`,
                    inline: true
                },
                {
                    name: 'Raison',
                    value: reason,
                    inline: true
                }
            )

        member.setNickname(nickname, reason);
        
        message.channel.send(functions.generateLineReplyContent({embeds:[embed]}, message));
        await member.send({ embeds: [embed] }).catch(() => {});

        functions.log(message.guild, embed);
        functions.addCase(message.guild.id, member.id, message.author.id, reason, 'censure');
    }
}