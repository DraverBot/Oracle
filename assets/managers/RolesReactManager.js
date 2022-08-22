const Discord = require('discord.js');
const functions = require('../functions.js');
const pack = functions.package();
const Mysql = require('mysql');

class RolesReactManager {
    /**
     * @param {Discord.Client} client 
     * @param {Mysql.Connection} db 
     */
    constructor(client, db) {
        this.client = client;
        this.db = db;
        this.cache = new Discord.Collection();
    }
    /**
     * @param {{ guild: Discord.Guild, ?channel: Discord.GuildTextBasedChannel, ?message: Discord.Message }} data 
     */
    hasRolesReact(data) {
        if (!this.cache.has(data.guild.id)) return false;

        const collection = this.cache.get(data.guild.id);
        if (data.channel) {
            if (collection.filter(x => x.channel_id == data.channel.id).size > 0) return true;
            return false;
        } else if (data.message) {
            if (collection.has(data.message.id)) return true;
            return false;
        } else {
            return true;
        };
    }
    /**
     * @param {{ guild: Discord.Guild }} data 
     */
    getList(data) {
        if (!this.hasRolesReact(data.guild)) return 'no roles';

        return this.cache.get(data.guild.id);
    }
    /**
     * @param {Object} data
     */
    query(data) {
        this.db.query(`INSERT INTO roles_react (${Object.keys(data).join(', ')}) VALUES (${Object.values(data).map((x) => `"${x}"`).join(', ')})`, (err) => {
            if (err) {
                functions.sendError(err, 'query in roles react manager', this.client.user);
                console.log(err);
            };

            this.loadCache();
        });
    }
    /**
     * @param {{ guild: Discord.Guild, channel: Discord.BaseGuildTextChannel, content: Discord.MessageOptions }} data
     */
    sendMessage(data) {
        const components = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.MessageSelectMenu()
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setCustomId('reacting-roles')
                    .setPlaceholder("Choisissez-un rôle")
                    .addOptions({
                        label: 'Non-configuré',
                        value: 'notset',
                        description: "Ce panel n'a pas été configuré"
                    })
            )
        
        let content = data.content;
        content.components = [ components ];
        data.channel.send(content).then((sent) => {
            if (!sent) return;

            let dataset = {
                guild_id: data.guild.id,
                channel_id: data.channel.id,
                message_id: sent.id
            };

            this.query(dataset);
        }).catch((e) => {console.log(e)});
    }
    /**
     * @param {{ guild: Discord.Guild, message: Discord.Message, role: Discord.Role }} data 
     */
    IsRoleSet(data) {
        if (!this.hasRolesReact({ guild: data.guild, message: data.message })) return;

        const dataget = this.cache.get(data.guild.id).get(data.message.id);
        return dataget.roles.includes(data.role.id);
    }
    /**
     * @param {{ guild: Discord.Guild, message: Discord.Message, role: Discord.Role, ?emoji: Discord.Emoji, description: String }} data 
     */
    setRole(data) {
        if (!this.hasRolesReact({ guild: data.guild, message: data.message })) return 'no roles';
        if (data.description.length > 100) return 'description too long';

        let component = data.message.components.find(x => x.components.find(x => x.customId == 'reacting-roles'));
        let selector = component.components.find(x => x.customId == 'reacting-roles');

        let option = {
            label: data.role.name,
            value: data.role.id,
            description: data.description
        };
        if (data.emoji) option.emoji = data.emoji;
        if (selector.options.length == 1 && selector.options[0].value == 'notset') {
            selector.spliceOptions(0, 1);
        }
        selector.addOptions(option);
        selector.setMaxValues(1);
        selector.setMinValues(1);

        data.message.edit({ components: [ new Discord.ActionRowBuilder().addComponents(selector) ] }).catch(() => {});
        let { roles } = this.cache.get(data.guild.id).get(data.message.id);

        if (roles.length == 0) role = data.role.id;
        else roles+=`-${data.role.id}`;

        this.db.query(`UPDATE roles_react SET roles="${roles}" WHERE message_id="${data.message.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, 'update in setRole roles react manager', this.client.user);
                console.log(err);
            };
            this.loadCache();
        });
    }
    /**
     * @param {{ guild: Discord.Guild, message: Discord.Message, role: Discord.Role }} data
     */
    removeRole(data) {
        if (!this.hasRolesReact({ guild: data.guild, message: data.message })) return 'no roles';
        if (!this.IsRoleSet(data)) return 'role not set';

        let { roles } = this.cache.get(data.guild.id).get(data.message.id);
        
        let component = data.message.components.find(x => x.components.find(x => x.customId == 'reacting-roles'));
        let selector = component.components.find(x => x.customId == 'reacting-roles');
        
        let option = selector.options.find(x => x.value == data.role.id);
        let index = selector.options.indexOf(option);
        selector.spliceOptions(index, 1);
        if (selector.options.length == 0) {
            selector.addOptions({
                label: 'Non-configuré',
                description: "Ce panel n'a pas encore été configuré",
                value: 'notset'
            });
        };
        selector.setMaxValues(1);
        selector.setMinValues(1);

        data.message.edit({ components: [ new Discord.SelectMenuBuilder().addComponents(selector) ] }).catch(() => {});

        let roleIndex = roles.indexOf(data.role.id);
        roles.splice(roleIndex, 1);
        roles = roles.join('-');

        this.db.query(`UPDATE roles_react SET roles="${roles}" WHERE message_id="${data.message.id}"`, (err, req) => {
            if (err) {
                functions.sendError(err, 'update in removeRole roles react manager', this.client.user);
                console.log(err);
            };
            this.loadCache();
        });
    }
    resetCache() {
        this.cache = new Discord.Collection();
    }
    loadCache() {
        this.db.query(`SELECT * FROM roles_react`, (err, req) => {
            if (err) throw err;
            this.resetCache();

            req.forEach((data) => {
                if (!this.cache.has(data.guild_id)) this.cache.set(data.guild_id, new Discord.Collection());

                const collection = this.cache.get(data.guild_id);
                let roles = data.roles.split('-');
                let dataset = data;
                dataset.roles = roles;

                collection.set(data.message_id, dataset);
                this.cache.set(data.guild_id, collection);
            });
        });
    }
    loadInteraction() {
        this.client.on('interactionCreate', /** @param {Discord.SelectMenuInteraction} interaction */ (interaction) => {
            if (interaction.isSelectMenu()) {
                if (interaction.customId == 'reacting-roles') {
                    if (!this.hasRolesReact({ guild: interaction.guild, message: interaction.message })) {
                        interaction.reply({ embeds: [ pack.embeds.classic(interaction.user)
                            .setTitle("Supprimé")
                            .setDescription(`Ce panel a été **supprimé**`)
                            .setColor('#ff0000')
                        ] }).catch(() => {});
                        interaction.message.edit({ components: [] }).catch(() => {});
                        return;
                    };

                    let roleId = interaction.values[0];
                    if (roleId == 'notset') return interaction.reply({ content: "Le panel n'a pas encore été configuré", ephemeral: true }).catch(() => {});
                    let role = interaction.guild.roles.cache.get(roleId);

                    let state = 'add';
                    if (interaction.member.roles.cache.has(roleId)) {
                        interaction.member.roles.remove(role).catch(() => {});
                        state = 'remove';
                    } else {
                        interaction.member.roles.add(role).catch(() => {});
                    };

                    let embeds = {
                        add: pack.embeds.classic(interaction.user)
                            .setTitle("Rôle ajouté")
                            .setDescription(`Le rôle <@&${roleId}> vous a été **ajouté**.`)
                            .setColor('#00ff00'),
                        remove: pack.embeds.classic(interaction.user)
                            .setTitle("Rôle retiré")
                            .setDescription(`Le rôle <@&${roleId}> vous a été **retiré**.`)
                            .setColor('#ff0000')
                    };

                    interaction.reply({ embeds: [ embeds[state] ], ephemeral: true }).catch(() => {});
                }
            }
        })
    }
    init() {
        this.loadCache();
        this.loadInteraction();

        console.log("Roles react manager is ready!");
    }
};

module.exports = RolesReactManager;