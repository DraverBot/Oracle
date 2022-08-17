const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'demote',
        description: "Dérank un utilisateur",
        options: [
            {
                name: 'highest',
                description: "Enlève le rôle le plus haut d'un utilisateur",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'utilisateur',
                        type: 'USER',
                        description: "Utilisateur à dérank",
                        required: true
                    },
                    {
                        name: 'raison',
                        type: 'STRING',
                        description: "raison",
                        required: true
                    }
                ]
            },
            {
                name: 'full',
                description: "Retire tout les rôles d'un utilisateur",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'utilisateur',
                        type: 'USER',
                        description: "Utilisateur à dérank",
                        required: true
                    },
                    {
                        name: 'raison',
                        type: 'STRING',
                        description: "raison",
                        required: true
                    }
                ]
            }
        ]
    },
    help: {
        dm: false,
        dev: false,
        permissions: ['manage_roles'],
        systems: [],
        cd: 5
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let member = interaction.options.getMember('utilisateur');
        if (!functions.checkPerms({ member, interaction, mod: interaction.member, checkBotCompare: true, checkSelfUser: true, checkOwner: true })) return;

        let select = interaction.options.getSubcommand();
        await interaction.guild.roles.fetch();
        
        let roles = member.roles.cache.filter(x => x.id !== interaction.guild.id);
        if (select == 'highest') {
            roles = roles.filter(x => x.position == member.roles.highest.position);
        };

        member.roles.remove(roles).catch(() => {});
        const reason = interaction.options.getString('raison');

        let embed = package.embeds.classic(interaction.user)
            .setTitle("Dérank")
            .setDescription(`${roles.size > 1 ? "Les rôles" : "Le rôle"} ${roles.map(x => `<@&${x.id}>`).join(' ')} ${roles.size > 1 ? "ont été" : "a été"} retiré à <@${member.id}>`)
            .addFields({name: 'Modérateur', value: `<@${interaction.member.id}> ( ${interaction.user.tag} \`${interaction.user.id}\` )`, inline: true},
{name: 'Membre', value: `<@${member.id}> ( ${member.user.tag} \`${member.id}\` )`, inline: true},
{name: 'Raison', value: reason, inline: true})
            .setColor('#ff0000')

        interaction.reply({ embeds: [ embed ] }).catch(() => {});
        functions.log(interaction.guild, embed);
    }
}