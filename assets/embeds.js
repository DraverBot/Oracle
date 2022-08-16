const emojis = require('./data/emojis.json');
const { MessageEmbed, User, Message, Interaction } = require('discord.js');
const collections = require('./data/collects');
const data = require('./data/data.json');

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
            .setTitle("🚫 Utilisateur introuvable")
            .setColor('DARK_RED')
            .setDescription(`Oops, cet utilisateur est introuvable, réessayez avec l'identifiant ou la mention.\n> Un [utilisateur](https://github.com/BotOracle/Documentation/blob/main/others/user.md) est attendu.`)
    },
    invalidNumber: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Nombre invalide")
            .setColor('RED')
            .setDescription(`Oops, on dirait que ce n'est pas un nombre correct.\n> Un [nombre](https://github.com/BotOracle/Documentation/blob/main/others/nombre.md) est attendu`)
    },
    noReason: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Raison invalide")
            .setColor('RED')
            .setDescription(`Oops, vous avez oublié de saisir la raison.\n> Un [texte](https://github.com/BotOracle/Documentation/blob/main/others/texte.md) est attendu`)
    },
    notEnoughHiger: (user, member) => {
        return generateBasic(user)
            .setTitle("🚫 Vous n'êtes pas assez élevé")
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
            .setTitle("🚫 Salon inexistant")
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
            .setTitle("🚫 Pas de texte")
            .setColor('RED')
            .setDescription(`Oops, vous avez oublié le texte, réessayez la commande en saisissant un texte.\n> Un [texte](https://github.com/BotOracle/Documentation/blob/main/others/texte.md) est attendu`)
    },
    collectorNoMessage: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Aucune réponse")
            .setColor('RED')
            .setDescription(`<@${user.id}>, je vous ai proposé un collecteur de messages mais il se trouve que vous n'y avez pas répondu.\nVeuillez réessayer.\n> Vous utilisez un [collecteur de messages](https://github.com/BotOracle/Documentation/blob/main/others/msg-collector.md)`)
    },
    invalidTime: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Durée invalide :x:")
            .setColor('RED')
            .setDescription(`Oops, ce n'est pas une durée valide, utilisez :\n\`s\` pour secondes\n\`m\` pour minutes\n\`h\` pour heures\n\`d\` pour jours\n\`y\` pour années.\n> [Documentation](https://github.com/BotOracle/Documentation/blob/main/others/temps.md)`)
    },
    invalidArg: (user) => {
        let text = "Oops, il manque des arguments, vérifiez que vous ayez saisis **tous** les arguments de cette commande et réessayez-la.\nLes arguments de la commande sont disponibles sur la documentation.";
        if (!collections.errorsOnInvalidArg.has(user.id)) collections.errors.set(user.id, 0);
        if (collections.errorsOnInvalidArg.get(user.id) > 3) text += "\nPrévenez mon développeur si cela persiste."
        collections.errorsOnInvalidArg.set(user.id, collections.errorsOnInvalidArg.get(user.id) + 1);

        return generateBasic(user)
            .setTitle("🚫 Arguments invalides :x:")
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
            .setTitle("🚫 Oops")
            .setDescription(text)
            .setColor('#ff0000')
    },
    guillement: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Erreur de guillemets")
            .setDescription(`Oops, vous ne pouvez pas saisir de \`"\` pour des raisons de sécurité.`)
            .setColor('#ff0000')
    },
    noRole: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Pas de rôle")
            .setDescription(`Vous n'avez pas précisé de [**rôle**](https://github.com/BotOracle/Documentation/blob/main/others/role.md)`)
            .setColor('#ff0000')
    },
    noRoles: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Pas de rôles")
            .setDescription(`Je n'ai pas trouvé suffisament de [**rôles**](https://github.com/BotOracle/Documentation/blob/main/others/role.md).`)
            .setColor('#ff0000')
    },
    noMember: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Pas de membres")
            .setDescription(`Je n'ai pas trouvé suffisament de [**membres**](https://github.com/BotOracle/Documentation/blob/main/others/user.md).`)
            .setColor('#ff0000')
    },
    noText: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Texte manquant")
            .setDescription(`Vous avez oublié de saisir un **texte**.\n> Un [texte](https://github.com/BotOracle/Documentation/blob/main/others/texte.md) est attendu`)
            .setColor('#ff0000')
    },
    waitForDb: (user) => {
        return generateBasic(user)
            .setTitle("En attente de la base de données")
            .setDescription(`Merci de patienter le temps que la base de données réponde ${emojis.loading}`)
            .setColor('ORANGE')
    },
    missingPermission: (user, perm) => {
        return generateBasic(user)
            .setTitle("🚫 Permission manquante")
            .setDescription(`La permission \`${perm}\` est requise pour exécuter cette commande.`)
            .setColor('#ff0000')
    },
    tickets: {
        created: (user) => {
            return generateBasic(user)
                .setTitle("Ticket ouvert")
                .setDescription(`Votre ticket a été ouvert`)
                .setColor('#ff0000')
        }
    },
    notTextChannel: (user) => {
        return generateBasic(user)
            .setTitle("🚫 Salon invalide")
            .setDescription(`Le salon que vous avez spécifié n'est pas un salon textuel.`)
            .setColor('#ff0000')
    },
    notEnoughCoins: (user) => {
        return generateBasic(user)
            .setTitle(`🚫 Pas assez ${data.coinsSuffix}`)
            .setDescription(`Vous n'avez pas assez ${data.coinsSuffix} pour faire ça.\n> :bulb:\n> Les ${data.coins} sont ceux comptés **qui ne sont pas dans votre banque**`)
            .setColor('#ff0000')
    },
    loto: {
        /**
         * 
         * @param {User} user 
         * @param {'participate' | 'end'} type 
         * @returns 
         */
        invalidLoto: (user, type) => {
            return generateBasic(user)
                .setTitle("❌ Loto invalide")
                .setDescription(`Il n'y a pas de loto sur le serveur.\n\n:warning:\n> Vous ne pouvez participer qu'a un loto en cours\n> Vous ne pouvez faire le tirage sur un loto terminé`)
                .setColor('#ff0000')
        },
        invalidNumbers: (user) => {
            return generateBasic(user)
                .setTitle("🚫 Nombres invalides")
                .setDescription(`Les nombres que vous avez spécifié sont invalides.\n**Vérifiez que vous avez le même nombre de numéro que celui requis**.\n:warning: Vous ne pouvez pas jouer deux fois le même numéro`)
                .setColor('#ff0000')
        },
        alreadyParticipate: (user) => {
            return generateBasic(user)
                .setTitle("❌ Participation déjà enregistrée")
                .setColor('#ff0000')
                .setDescription(`Vous participez déjà à ce loto`)
        },
        /**
         * @param {User} user 
         * @param {Number[]} numbers 
         * @param {Number[]} complementaries 
         */
        added: (user, numbers, complementaries) => {
            return generateBasic(user)
                .setTitle("✅ Participation enregistrée")
                .setDescription(`J'ai enregistré votre participation`)
                .addFields(
                    {
                        name: "Numéro gagnants",
                        value: numbers.join(', '),
                        inline: true
                    },
                    {
                        name: "Numéro complémentaires",
                        value: complementaries.join(', '),
                        inline: true
                    }
                )
                .setColor('#00ff00')
        },
        /**
         * @param {{ numbers: Number[], complementaries: Number[], winners: [], user: User }} Edata 
         */
        end: (Edata) => {
            return generateBasic(Edata.user)
                .setTitle('🎉 Tirage')
                .setDescription(`**Numéro gagnants :** ${Edata.numbers.join(' ')}\n**Numéro complémentaires :** ${Edata.complementaries.join(' ')}

${Edata.winners.length == 0 ? 'Pas de gagnants' : Edata.winners.map(w => `<@${w.user_id}> : ${w.reward} ${data.coins}`).join('\n')}`)
                .setColor('#00ee00')
                .setFooter({ iconURL: undefined, text: `Les ${data.coins} ont été ajoutés au(x) gagnant(s)` })
        },
        started: (user, numbers, complementaries, reward, Rtime) => {
            let time = ((parseInt(Rtime) + Date.now()) / 1000).toFixed(0);

            return generateBasic(user)
                .setTitle("🎉 Loto lancé")
                .setDescription(`Le loto a été lancé !\nIl prendra fin le <t:${time}:F> ( <t:${time}:R> )\n\nPour participer il faut **${numbers}** numéro et **${complementaries}** numéro complémentaires.\n\nRécompense :\n${reward} ${data.coins}`)
                .setColor('#ff0000')
        }
    },
    giveaway: {
        noGw: (user, id) => {
            return generateBasic(user)
                .setTitle("❌ Giveaway introuvable")
                .setDescription(`Le giveaway avec l'identifiant \`${id}\` est introuvable.`)
                .setColor('#ff0000')
        },
        alreadyEnded: (user) => {
            return generateBasic(user)
                .setTitle("❌ Giveaway terminé")
                .setDescription(`Ce giveaway est déjà terminé`)
                .setColor('#ff0000')
        },
        notEnded: (user) => {
            return generateBasic(user)
                .setTitle("❌ Giveaway en cours")
                .setDescription(`Ce giveaway n'est pas terminé`)
                .setColor('#ff0000')
        }
    }
}