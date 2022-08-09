const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

module.exports = {
    configs: {
        name: 'role-react',
        description: "Configure les rôles à réaction",
        options: [
            {
                name: 'envoyer',
                description: "Envoie le message qui aura les réactions",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'embed',
                        type: 'BOOLEAN',
                        required: true,
                        description: "Définit si le message est un embed"
                    },
                    {
                        name: 'contenu',
                        type: 'STRING',
                        required: true,
                        description: "Définit le contenu du message"
                    },
                    {
                        name: 'salon',
                        description: "Salon ou sera envoyé le message",
                        required: true,
                        type: 'CHANNEL'
                    },
                    {
                        name: 'titre',
                        description: "Titre de l'embed (si embed)",
                        required: false,
                        type: 'STRING'
                    },
                    {
                        name: 'couleur',
                        description: "Couleur de l'embed (si embed)",
                        required: false,
                        type: 'STRING'
                    },
                    {
                        name: 'image',
                        description: "URL de l'image de l'embed (si embed)",
                        type: 'STRING',
                        required: false
                    }
                ]
            },
            {
                name: 'ajouter',
                description: "Ajoute un rôle",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'role',
                        description: "Rôle à donner",
                        type: 'ROLE',
                        required: true
                    },
                    {
                        name: 'identifiant',
                        description: "Identifiant du message (celui envoyé par la commande /role-react envoyer)",
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: 'salon',
                        description: "Salon du message",
                        required: true,
                        type: 'CHANNEL'
                    },
                    {
                        name: 'description',
                        description: "Description du rôle à réaction",
                        type: 'STRING',
                        required: true
                    }
                ]
            },
            {
                name: 'supprime',
                description: "Supprime un rôle",
                type: 'SUB_COMMAND',
                options: [
                    {
                        name: 'role',
                        description: "Rôle à enlever",
                        type: 'ROLE',
                        required: true
                    },
                    {
                        name: 'identifiant',
                        description: "Identifiant du message (celui envoyé par la commande /role-react envoyer)",
                        type: 'STRING',
                        required: true
                    },
                    {
                        name: 'salon',
                        description: "Salon du message",
                        required: true,
                        type: 'CHANNEL'
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
        const subcommand = interaction.options.getSubcommand();
        const manager = interaction.client.RolesReactManager;

        if (subcommand == 'envoyer') {
            let isEmbed = interaction.options.getBoolean('embed');
            let channel = interaction.options.getChannel('salon');
            let content = interaction.options.getString('contenu').replace(/\\n/g, '\n');
            let title = interaction.options.getString('titre');
            let color = interaction.options.getString('couleur') ?? interaction.guild.me.displayHexColor;
            let image = interaction.options.getString('image');

            if (!['text', 'news'].map(x => `GUILD_${x.toUpperCase()}`).includes(channel.type)) return interaction.reply({ embeds: [ package.embeds.notTextChannel(interaction.user) ] });

            let data = {};
            if (isEmbed == false) data.content = content;
            else {
                const embed = new Discord.MessageEmbed()
                    .setDescription(content)
                
                const validation = /(jpg|gif|png|JPG|GIF|PNG|JPEG|jpeg)$/;
                
                if (image && !validation.test(image)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Image invalide")
                    .setDescription(`Hola ? D'après mes agents de vérification, votre image est invalide.\nSi ce n'est pas le cas, contactez mes développeurs`)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                if (image) embed.setImage(image);
                if (title) embed.setTitle(title);

                const reg = /^#[0-9A-F]{6}$/i;
                if (!reg.test(color)) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Couleur invalide")
                    .setDescription(`Vous avez saisi une couleur invalide.\nUtilisez le code hexadécimal.\nExemple :\n> \`#AA19EE\``)
                    .setColor('#ff0000')
                ] }).catch(() => {});

                embed.setColor(color);

                data.embeds = [ embed ];
            };

            manager.sendMessage({ guild: interaction.guild, channel: channel, content: data });
            interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Envoi")
                .setDescription(`Le message a été envoyé dans <#${channel.id}>`)
                .setColor(color)
            ] }).catch(() => {});
        };
        if (subcommand == 'ajouter') {
            let role = interaction.options.getRole('role');
            let channel = interaction.options.getChannel('salon');
            let id = interaction.options.getString('identifiant');
            let description = interaction.options.getString('description');

            if (!['text', 'news'].map(x => `GUILD_${x.toUpperCase()}`).includes(channel.type)) return interaction.reply({ embeds: [ package.embeds.notTextChannel(interaction.user) ] });

            let msgs = await channel.messages.fetch();
            if (!msgs.has(id) || msgs.get(id).author.id !== interaction.client.user.id) return interaction.reply({ content: "Je ne trouve pas ce message, ou il n'a pas été envoyé par moi." }).catch(() => {});

            if (role.position > interaction.member.roles.highest.position) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Rôle trop haut")
                .setDescription(`<@&${role.id}> est trop haut pour vous`)
                .setColor('#ff0000')
            ] }).catch(() => {});
            if (manager.IsRoleSet({ guild: interaction.guild, message: msgs.get(id), role: role })) return interaction.reply({ content: "Ce rôle a déjà été configuré" }).catch(() => {});

            const add = (emoji) => {
                let dataset = { guild: interaction.guild, message: msgs.get(id), role: role, description: description };
                if (emoji) dataset.emoji = emoji;

                manager.setRole(dataset);

                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Ajout")
                    .setDescription(`Le rôle <@&${role.id}> est en train d'être ajouté`)
                    .setColor('#00ff00')
                ] }).catch(() => {});
            };

            await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Émoji")
                .setDescription(`Voulez-vous ajouter un émoji pour le rôle ?`)
                .setColor('YELLOW')
            ], components: [ new Discord.MessageActionRow({ components: [ new Discord.MessageButton({ label: 'Oui', style: 'SUCCESS', customId: 'yes' }), new Discord.MessageButton({ label: 'Non', style: 'DANGER', customId: 'no' }) ] }) ] }).catch(() => {});

            let reply = await interaction.fetchReply();
            if (!reply) interaction.reply({ content: "Une erreur a eu lieu lors de l'exécution de la commande." });

            const collector = reply.createMessageComponentCollector({ filter: x => x.user.id == interaction.user.id, time: 120000 });
            collector.on('collect', async(i) => {
                await i.deferUpdate();
                if (i.customId == 'yes') {
                    await interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Émoji")
                        .setDescription(`Ajoutez l'émoji en réaction à ce message`)
                        .setColor(interaction.guild.me.displayHexColor)
                    ] });

                    collector.stop();
                    reply = await interaction.fetchReply();

                    const reactCollector = reply.createReactionCollector({ filter: (r, u) => u.id == interaction.user.id, max: 1, time: 120000 });
                    reactCollector.on('end', async(collected) => {
                        if (collected.size == 0) {
                            await interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                                .setTitle("Pas de réponse")
                                .setDescription(`Vous n'avez pas répondu`)
                                .setColor('#ff0000')
                            ] }).catch(() => {});
                            return;
                        };
                        add(collected.first().emoji);
                    })
                } else {
                    add();
                    collector.stop();
                }
            });

            collector.on('end', async() => {
                await interaction.editReply({ components: [] }).catch(() => {});
            });
        };
        if (subcommand == 'supprime') {
            let role = interaction.options.getRole('role');
            let channel = interaction.options.getChannel('salon');
            let id = interaction.options.getString('identifiant');
            
            if (!['text', 'news'].map(x => `GUILD_${x.toUpperCase()}`).includes(channel.type)) return interaction.reply({ embeds: [ package.embeds.notTextChannel(interaction.user) ] });

            let msgs = await channel.messages.fetch();
            if (!msgs.has(id) || msgs.get(id).author.id !== interaction.client.user.id) return interaction.reply({ content: "Je ne trouve pas ce message, ou il n'a pas été envoyé par moi." }).catch(() => {});

            if (role.position > interaction.member.roles.highest.position) return interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Rôle trop haut")
                .setDescription(`<@&${role.id}> est trop haut pour vous`)
                .setColor('#ff0000')
            ] }).catch(() => {});
            if (!manager.IsRoleSet({ guild: interaction.guild, message: msgs.get(id), role: role })) return interaction.reply({ content: "Ce rôle n'a pas été configuré" }).catch(() => {});

            const remove = () => {
                let dataset = { guild: interaction.guild, message: msgs.get(id), role: role };

                manager.removeRole(dataset);

                interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                    .setTitle("Suppression")
                    .setDescription(`Le rôle <@&${role.id}> est en train d'être retiré`)
                    .setColor('#ff0000')
                ] }).catch(() => {});
            };

            await interaction.reply({ embeds: [ package.embeds.classic(interaction.user)
                .setTitle("Confirmation")
                .setDescription(`Êtes-vous sûr de supprimer ce rôle de la liste ?`)
                .setColor('YELLOW')
            ], components: [ new Discord.MessageActionRow({ components: [ new Discord.MessageButton({ label: 'Oui', style: 'SUCCESS', customId: 'yes' }), new Discord.MessageButton({ label: 'Non', style: 'DANGER', customId: 'no' }) ] }) ] }).catch(() => {});

            let reply = await interaction.fetchReply();
            if (!reply) interaction.reply({ content: "Une erreur a eu lieu lors de l'exécution de la commande." });

            const collector = reply.createMessageComponentCollector({ filter: x => x.user.id == interaction.user.id, time: 120000 });
            collector.on('collect', async(i) => {
                await i.deferUpdate();
                collector.stop();
                if (i.customId == 'no') {
                    await interaction.editReply({ embeds: [ package.embeds.classic(interaction.user)
                        .setTitle("Annulation")
                        .setDescription(`La suppression a été annulée.`)
                        .setColor(interaction.guild.me.displayHexColor)
                    ] });

                } else {
                    remove();
                };
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(() => {});
            })
        }
    }
}