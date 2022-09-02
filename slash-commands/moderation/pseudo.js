const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        permissions: ['manage_nicknames']
    },
    configs: {
        name: 'pseudo',
        description: "Gère le pseudo d'un membre",
        options: [
            {
                name: "définir",
                description: "Définit le pseudo d'un membre",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: "pseudo",
                        description: "Pseudo à donner au membre",
                        required: true,
                        type: 'STRING'
                    },
                    {
                        name: 'membre',
                        description: "Membre à renommer",
                        required: false,
                        type: 'USER'
                    }
                ]
            },
            {
                name: "réinitialiser",
                description: "Réinitialise le pseudo d'un membre",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'membre',
                        required: false,
                        description: "Membre à renommer",
                        type: 'USER'
                    }
                ]
            }
        ]
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: (interaction) => {
        const subcommand = interaction.options.getSubcommand();
        const member = interaction.options.getMember('membre') ?? interaction.member;

        let before = member.nickname ?? member.user.username;
        if (!functions.checkPerms({ interaction, member, mod: interaction.member, checkBotCompare: true, checkOwner: true })) return;
        let nickname = interaction.options.get('pseudo')?.value ?? null;

        member.setNickname(nickname).catch(() => {});

        let reset = subcommand == 'réinitialiser';
        interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
            .setTitle(`Pseudo ${reset ? 'réinitialisé':'modifié'}`)
            .setDescription(reset ? `Le pseudo de <@${member.id}> a été réinitialisé`: `Le pseudo de <@${member.id}> a été changé en ${nickname}`)
            .setColor(member.displayHexColor)
        ] }).catch(() => {});

        let action = reset ? 'pseudo réinitialisé':'pseudo modifié';

        const fields = [
            {
                name: 'Modérateur',
                value: `<@${interaction.user.id}> ( ${interaction.user.tag} ${interaction.user.id} )`,
                inline: true
            },
            {
                name: 'Membre',
                value: `<@${member.id}> ( ${member.user.tag} ${member.id} )`,
                inline: true
            }
        ];
        let embed = package.embeds.classic(interaction.user)
            .setTitle(functions.capitalize(action))
            .setDescription(`Le pseudo de <@${member.id}> a été réinitialisé`)
            .setColor('#ff0000')
        
        if (!reset) {
            embed.setDescription(`Le pseudo de <@${member.id}> a été modifié`)
            fields.push({name: '\u200b', value: '\u200b', inline: false})
            fields.push({
                name: "Avant",
                value: before,
                inline: true
            },
            {
                name: 'Après',
                value: nickname,
                inline: true
            });
        } else {
            fields.push({
                name: 'Pseudo',
                value: before,
                inline: true
            });
        };
        
        embed.addFields(fields);
        functions.log(interaction.guild, embed);

        functions.addCase(interaction.guild.id, member.id, interaction.user.id, reset ? `Ancien pseudo : ${before}` : `Ancien pseudo : ${before}\n\nNouveau pseudo : ${nickname}`, action.toLowerCase());
    }
};