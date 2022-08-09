module.exports.help = {
    name: "massban",
    description: "Permet de bannir plusieurs membres à la fois",
    aliases: ['multipleban'],
    permissions: ['ban_members'],
    private: false,
    dm: false,
    cooldown: 10
};

const Discord = require('discord.js');
const functions = require('../../assets/functions');
const embeds = require('../../assets/embeds');

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 */
module.exports.run = (message, args, client, prefix) => {
    if (args.length === 0) return message.channel.send({ embeds: [
        new Discord.MessageEmbed()
            .setTitle("Arguments insuffisants")
            .setColor('RED')
            .setTimestamp()
            .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({ dynamic: true })})
            .setAuthor({ text: message.guild.name, iconURL: message.guild.icon ? message.guild.iconURL({dynamic: true}) : message.author.avatarURL({dynamic: true})})
            .setDescription(`Veuillez saisir des arguments : au moins **2** membres et la raison.\n\nExemple : \`${prefix}massban @user1 @user2 @user3 userid4 mauvaise attitude\``)
    ] });

    const members = [];

    if (message.mentions.members.size > 0) {
        message.mentions.members.forEach((member) => {
            members.push(member);
        });
    };

    for (let i = 0; i< args.length; i++) {
        let arg = args[i];
        let member = message.guild.members.cache.get(arg);
        if (member) {
            if (!members.find((x) => x.id === member.id)) {
                members.push(member);
            };
        };
    };

    go = true;
    members.forEach((member) => {
        if (!member.bannable) go = false;
        if (functions.compareRoles(member, message.member) == false) go = false;    
    });

    if (go == false) {
        return message.channel.send({ embeds: [
            new Discord.MessageEmbed()
                .setTitle(":x: Membre imbanissable.")
                .setDescription(`Un ou plusieurs des ${members.length} membres à bannir ne peut(peuvent) pas être banni(s).\nDeux raisons peuvent être à l'origine de ceci :\n**1)** Je n'ai pas les permissions nécéssaires\n**2)**Ce(s) membre(s) est(sont) supérieur(s) ou égal(égaux) à vous dans la hiérarchie des rôles`)
                .setTimestamp()
                .setFooter(message.author.username, message.author.avatarURL({ dynamic: true }))
                .setColor('RED')
        ] });
    };
    let reason = '';
    indexStop = 0;

    let i = 0;

    while (i < args.length) {
        let member = message.guild.members.cache.get(args[i]);
        if (!member) {
            indexStop = i;
            i = args.length + 1;
        };
        i++;
    };

    const argsArray = args.slice(indexStop+1);
    reason = argsArray.join(' ');
    
    if (reason) return message.channel.send({ embeds: [embeds.noReason(message.author)] });
    let total = members.length;

    members.forEach((x) => {
        const emojis = require('../../assets/emojis.json');

        x.send({ embeds: [
            new Discord.MessageEmbed()
                .setTitle("Ban")
                .setDescription(`${emojis.ba}${emojis.nn}${emojis.ed}\nVous avez été banni de ${message.guild.name} pour la raison \`\`\`${reason}\`\`\``)
                .setColor('RED')
                .setFooter({ text: message.author.username, iconURL: message.author.avatarURL({ dynamic: true })})
                .setTimestamp()
        ] }).catch(() => {});

        functions.log(message.guild, functions.package().embeds.classic(message.author)
            .setTitle("Ban")
            .addFields(
                {
                    name: 'Modérateur',
                    value: `<@${message.author.id}> ( \`${message.author.id}\` \`${message.author.tag}\` )`,
                    inline: true
                },
                {
                    name: 'Membre',
                    value: `<@${x.id}> ( \`${x.id}\` \`${x.user.tag}\` )`,
                    inline: true
                },
                {
                    name: 'Raison',
                    value: reason,
                    inline: true
                }
            )
            .setDescription(`Ce membre a été victime de mass-ban`)
        );
        functions.addCase(message.guild.id, x.id, message.author.id, reason, 'mass-ban');
        
        x.ban({reason: `${reason} (par ${message.author.tag}, ${message.author.id})`}).catch(() => {total--});
    });

    message.channel.send({ content: `J'ai banni ${total} membres sur un total de ${members.length} membres sélectionnés` });
}