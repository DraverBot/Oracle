const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports.help = {
    name: 'prefix',
    description: "Configure le préfixe.",
    aliases: ['prefixe'],
    permissions: ['manage_guild'],
    cooldown: 5,
    private: false,
    dm: false
};

/**
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Discord.Client} client 
 * @param {String} prefix
 */
module.exports.run = (message, args, client, prefix) => {
    const action = (args.shift() || 'help').toLowerCase();

    if (action === 'set') {
        const prefixe = args.shift();

        if (!prefixe) return message.channel.send({ embeds: [ package.embeds.classic(message.author)
            .setDescription(`Oops, vous avez oublié de saisir un préfixe.`)
            .setTitle("Pas de paramètre")
            .setColor('#ff0000')
        ] });
        if (prefixe.includes('"')) return message.channel.send({ embeds: [ package.embeds.guillement(message.author) ] });
    
        client.db.query(`SELECT * FROM prefixes WHERE guild_id="${message.guild.id}"`, (err, req) => {
            if (err) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });

            const done = () => {
                message.channel.send({ embeds: [ package.embeds.classic(message.author)
                    .setTitle("Configuré !")
                    .setDescription(`J'ai mis le préfixe sur \`${prefixe}\``)
                    .setColor('GREEN')
                ] })
            }
            if (req.length === 0) {
                client.db.query(`INSERT INTO prefixes (guild_id, prefix) VALUES ("${message.guild.id}", "${prefixe}")`, (e) => {
                    if (e) message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
                    done();
                });
            } else {
                client.db.query(`UPDATE prefixes SET prefix="${prefixe}" WHERE guild_id="${message.guild.id}"`, (e) => {
                    if (e) return message.channel.send({ embeds: [ package.embeds.errorSQL(message.author) ] });
                    done();
                });
            };
        });
    } else {
        const embed = package.embeds.classic(message.author)
            .setTitle("Aide")
            .setDescription(`Mon préfixe est \`${prefix}\`.\n\n**Note: les crochets tels que \`<>\` ne sont pas à utiliser lors de l'éxécution de la commande.`)
            .addField(`Utilisation`, `\`${prefix}prefix set <préfixe>\``, true)
            .addField('Exemple', `\`${prefix}prefix set $\``, true)
            .setColor('ORANGE')

        message.channel.send({ embeds: [ embed ] });
    };
};