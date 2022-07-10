const emojis = require('./data/emojis.json');
const { MessageEmbed, User, Message } = require('discord.js');
const collections = require('./data/collects');

/**
 * @param {User} user 
 * @returns {MessageEmbed}
 */
const generateBasic = (user) => {
    return new MessageEmbed()
        .setTimestamp()
        .setFooter({ text: user.username.toString(), iconURL: user.avatarURL({dynamic: true})})
}

module.exports = {
    /**
     * @param {User} user 
     * @returns {MessageEmbed}
     */
    noUser: (user) => {
        return new MessageEmbed()
            .setTitle("Utilisateur introuvable")
            .setColor('DARK_RED')
            .setDescription(`Oops, cet utilisateur est introuvable, réessayez avec l'identifiant ou la mention.\n> Un [utilisateur](https://github.com/BotOracle/Documentation/blob/main/others/user.md) est attendu.`)
    },
    invalidNumber: (user) => {
        return generateBasic(user)
            .setTitle("Nombre invalide")
            .setColor('RED')
            .setDescription(`Oops, on dirait que ce n'est pas un nombre correct.\n> Un [nombre](https://github.com/BotOracle/Documentation/blob/main/others/nombre.md) est attendu`)
    },
    noReason: (user) => {
        return generateBasic(user)
            .setTitle("Raison invalide")
            .setColor('RED')
            .setDescription(`Oops, vous avez oublié de saisir la raison.\n> Un [texte](https://github.com/BotOracle/Documentation/blob/main/others/texte.md) est attendu`)
    },
    notEnoughHiger: (user, member) => {
        return generateBasic(user)
            .setTitle("Vous n'êtes pas assez élevé")
            .setDescription(`Oops, <@${member.id}> est supérieur ou égal à vous dans la hiérarchie des rôles.`)
            .setColor('DARK_RED')
    },
    classic: (user) => {
        return generateBasic(user);
    },
    /**
     * @param {Discord.Guild} guild 
     */
    log: (guild) => {
        let embed = new MessageEmbed()
            .setTimestamp()
        
        if (guild.icon) embed.setFooter({ text: guild.name, iconURL: guild.iconURL({ dynamic: true })})
        return embed; 
    },
    /**
     * 
     * @param {User} user 
     */
    noChannel: (user) => {
        return generateBasic(user)
            .setTitle("Salon inexistant")
            .setDescription(`Oops, ce salon n'existe pas, réessayez avec identifiant ou la mention.\n> Un [salon](https://github.com/BotOracle/Documentation/blob/main/others/salon.md) est attendu`)
            .setColor('RED')
    },
    cancel: () => {
        return new MessageEmbed()
            .setTitle(`:bulb: Commande annulée`)
            .setColor('YELLOW')
    },
    noText: (user) => {
        return generateBasic(user)
            .setTitle("Pas de texte")
            .setColor('RED')
            .setDescription(`Oops, vous avez oublié le texte, réessayez la commande en saisissant un texte.\n> Un [texte](https://github.com/BotOracle/Documentation/blob/main/others/texte.md) est attendu`)
    },
    collectorNoMessage: (user) => {
        return generateBasic(user)
            .setTitle("Aucune réponse")
            .setColor('RED')
            .setDescription(`<@${user.id}>, je vous ai proposé un collecteur de messages mais il se trouve que vous n'y avez pas répondu.\nVeuillez réessayer.\n> Vous utilisez un [collecteur de messages](https://github.com/BotOracle/Documentation/blob/main/others/msg-collector.md)`)
    },
    invalidTime: (user) => {
        return generateBasic(user)
            .setTitle("Durée invalide :x:")
            .setColor('RED')
            .setDescription(`Oops, ce n'est pas une durée valide, utilisez :\n\`s\` pour secondes\n\`m\` pour minutes\n\`h\` pour heures\n\`d\` pour jours\n\`y\` pour années.\n> [Documentation](https://github.com/BotOracle/Documentation/blob/main/others/temps.md)`)
    },
    invalidArg: (user) => {
        let text = "Oops, il manque des arguments, vérifiez que vous ayez saisis **tous** les arguments de cette commande et réessayez-la.\nLes arguments de la commande sont disponibles sur la documentation.";
        if (!collections.errorsOnInvalidArg.has(user.id)) collections.errors.set(user.id, 0);
        if (collections.errorsOnInvalidArg.get(user.id) > 3) text += "\nPrévenez mon développeur si cela persiste."
        collections.errorsOnInvalidArg.set(user.id, collections.errorsOnInvalidArg.get(user.id) + 1);

        return generateBasic(user)
            .setTitle("Arguments invalides :x:")
            .setDescription(text)
            .setColor('RED')
    },
    waitForReacts: () => {
        return new MessageEmbed()
            .setDescription(`${emojis.loading} Patientez le temps de l'ajout des réactions`)
            .setColor('YELLOW')
    },
    errorSQL: (user) => {
        let text = "Vous ne devriez pas rencontrer ce problème, une erreur a eu lieu lors de l'interaction avec la base de données.";
        if (!collections.errors.has(user.id)) collections.errors.set(user.id, 0);
        if (collections.errors.get(user.id) > 3) text += "\nPrévenez mon développeur si cela persiste."
        collections.errors.set(user.id, collections.errors.get(user.id) + 1);

        return generateBasic(user)
            .setTitle("Oops")
            .setDescription(text)
            .setColor('#ff0000')
    },
    guillement: (user) => {
        return generateBasic(user)
            .setTitle("Oula !")
            .setDescription(`Oops, vous ne pouvez pas saisir de \`"\` pour des raisons de sécurité.`)
            .setColor('#ff0000')
    },
    noRoles: (user) => {
        return generateBasic(user)
            .setTitle("Pas de rôles")
            .setDescription(`Je n'ai pas trouvé suffisament de [**rôles**](https://github.com/BotOracle/Documentation/blob/main/others/role.md).`)
            .setColor('#ff0000')
    },
    noMember: (user) => {
        return generateBasic(user)
            .setTitle("Pas de membres")
            .setDescription(`Je n'ai pas trouvé suffisament de [**membres**](https://github.com/BotOracle/Documentation/blob/main/others/user.md).`)
            .setColor('#ff0000')
    },
    noText: (user) => {
        return generateBasic(user)
            .setTitle("Texte manquant")
            .setDescription(`Vous avez oublié de saisir un **texte**.\n> Un [texte](https://github.com/BotOracle/Documentation/blob/main/others/texte.md) est attendu`)
            .setColor('#ff0000')
    },
    waitForDb: (user) => {
        return generateBasic(user)
            .setTitle("En attentente de la base de données")
            .setDescription(`Merci de patienter le temps que la base de données réponde ${emojis.loading}`)
            .setColor('ORANGE')
    }
}