const Discord = require('discord.js');
const functions = require('../../assets/functions.js');
const package = functions.package();

module.exports.help = {
    name: 'role',
    description: "Ajoute un rôle choisi à un utilisateur choisi",
    permissions: ['manage_roles'],
    aliases: ['addrole'],
    cooldown: 5,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 * @param {Array} args
 */
module.exports.run = async(message, args, client, prefix) => {
    await message.guild.roles.fetch();
    await message.guild.members.fetch();

    let roles = new Discord.Collection();
    let members = new Discord.Collection();

    args.forEach((arg) => {
        let roleTest = message.guild.roles.cache.get(arg);
        if (roleTest) return roles.set(roleTest.id, roleTest);

        let memberTest = message.guild.members.cache.get(arg);
        if (memberTest) return members.set(memberTest.id, memberTest);
    });

    message.mentions.roles.filter(x => !roles.has(x.id)).forEach((x) => roles.set(x.id, x));
    message.mentions.members.filter(x => !members.has(x.id)).forEach((x) => members.set(x.id, x));

    roles = roles.filter(x => x.position < message.guild.me.roles.highest.position);
    members = members.filter(x => x.roles.highest.position < message.guild.me.roles.highest.position);

    if (roles.size == 0) return functions.reply(message, package.embeds.noRoles(message.author));
    if (members.size == 0) return functions.reply(message, package.embeds.noMember(message.author));

    let ai = 0;
    let ri = 0;

    let added = package.embeds.classic(message.author)
        .setTitle("Rôles ajouté")
        .setColor("#00ff00")
        .setDescription(`__Rôles **ajoutés :**__\n`)
    let removed = package.embeds.classic(message.author)
        .setTitle("Rôles retirés")
        .setColor('#00ff00')
        .setDescription(`__Rôles **retirés :**__\n`)

    members.forEach(/**@param {Discord.GuildMember} member*/(member) => {
        roles.forEach((role) => {
            if (!member.roles.cache.has(role)) {
                member.roles.add(role).catch(() => {});
                added.setDescription(added.description + `rôle <@&${role.id}> ajouté à <@${member.id}>+`)
                ai++;
            } else {
                ai++;
                member.roles.remove(role).catch(() => {});
                added.setDescription(removed.description + `rôles <@&${role.id}> retiré à <@${member.id}>+`)
            };
        });
    });

    let embeds = [];
    if (ai > 0) {
        let text = added.description;
        text = text.split('+').join(', ');

        embeds.push(added);
    };
    if (ri > 0) {
        let text = removed.description;
        text = text.split('+').join(', ');

        embeds.push(removed);
    };

    message.channel.send({ embeds: embeds, reply: { messageReference: message } } );
}