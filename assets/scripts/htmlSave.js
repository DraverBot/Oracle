const Discord = require('discord.js');
const functions = require('../functions');
const fs = require('fs');
const moment = require('moment');
moment.locale('fr');

/**
 * @param {String} text 
 * @param {Discord.Message} message 
 * @returns 
 */
const format = (text, message) => {
    text.split('\n').forEach((line) => {
        if (line.startsWith('> ')) {
            let newLine = line.replace('> ', '<blockquote>');
            newLine += "</blockquote>";

            text = text.replace(line, newLine);
        }
    });
    [{x: '**', y: 'strong'}, {x: '*', y: 'em'}, {x: '__', y: 'span style="text-decoration: underline;"', z: 'span'}, {x: '~~', y: 'span style="text-decoration: overline;"', z: 'span'}].forEach((x) => {
        let second = false;
        for (let i = 0; i < text.length; i++) {
            let select = text[i];
            if (x.x.length == 2) select+= text[i + 1];

            if (select == x.x) {
                if (second == false) {
                    text = text.replace(x.x, `<${x.y}>`);
                } else {
                    text = text.replace(x.x, `</${(x?.z ?? x.y)}>`);
                };
                second = !second;
            };
        };

        if (second == true) {
            text = text.replace(x.y, x.x);
        };
    });

    message.mentions.members.forEach((member) => {
        text = text.replace(`<@${member.id}>`, `<span class="mention interactive">@${member?.nickname ?? member.user.username}</span>`);
    });
    message.mentions.users.forEach((user) => {

        text = text.replace(`<@${user.id}>`, `<span class="mention interactive">@${message.guild.members.cache.get(user.id)?.nickname ?? user.username}</span>`);
    });
    message.mentions.roles.forEach((role) => {
        text = text.replace(`<@&${role.id}>`, `<span class="mention interactive">@${role.name}</span>`);
    });
    message.mentions.channels.forEach((channel) => {
        text = text.replace(`<#${channel.id}>`, `<span class="mention interactive">#${channel.name}</span>`);
    });
    text.split('<@').forEach((splited) => {
        if (splited.startsWith('&')) {
            let role = message.guild.roles.cache.get(splited.substring(0, splited.indexOf('>')));
            if (!role) return;

            text = text.replace(`<@&${role.id}>`, `<span class="mention interactive">@${role.name}</span>`);
        } else if (splited.startsWith('#')) {
            let channel = message.guild.channels.cache.get(splited.substring(0, splited.indexOf('>')));
            if (!channel) return;

            text = text.replace(`<#${channel.id}>`, `<span class="mention interactive">#${channel.name}</span>`);
        } else {
            let member = message.guild.members.cache.get(splited.substring(0, splited.indexOf('>')));
            if (!member) return;

            text = text.replace(`<@${member.id}>`, `<span class="mention interactive">@${member?.nickname ?? member.user.username}</span>`);
        }
    });

    text = text.replace(/@everyone/g, `<span class="mention interactive">@everyone</span>`);
    text = text.replace(/@here/g, `<span class="mention interactive">@here</span>`);

    return text;
}

/**
 * @param {Discord.Collection} messages
 * @param {String} customId 
 */
const save = (messages, customId) => {
    let fileContent = "";
    messages.forEach(/**@param {Discord.Message} message*/(message) => {
        let messageContent = message.content;
        if (messageContent) {
            messageContent = format(messageContent, message);
        };
        let embeds = "";
        if (message.embeds.length > 0) {
            message.embeds.forEach((embed) => {
                let embedDescription;
                if (embed.description) embedDescription = format(embed.description, message);
                embeds+=`<div class="embed" style="border-color: ${embed?.hexColor ?? '#000000'}">
                    ${embed.author ? `
                    <div class="embedAuthor">
                        ${embed.author.iconURL ? `
                        <img class="embedAuthorIcon" src="${embed.author.iconURL}" alt="Icone auteur">`:''}
                        ${embed.author.name ? `
                        <span class="embedAuthorName">${embed.author.name}</span>`:''}
                    </div>`:''}
                    ${embed.url ? `
                    <a class="embedTitle embedTitleLink" href="${embed.url}" target="_blank">${embed.title}>`:`
                    <div class="embedTitle">${embed.title}</div>`}
                    ${embed.description ? `<div class="embedDescription">${embedDescription}</div>` : ''}
                    ${embed.fields.length > 0 ? `<div class="embedFields">
                        ${embed.fields.map((field) => `<div class="embedField">
                            <div class="embedFieldName">${field.name}</div>
                            <div class="embedFieldValue">${format(field.value, message)}</div>
                        </div>`).join('\n')}
                    </div>` : ''}
                    ${embed.image ? `
                    <a class="embedImage" href="${embed.image}" target="_blank" style="width: 128px; height: 128px;">
                        <img src="${embed.image}" alt="image" target="_blank" style="width: 128px; height: 128px;">
                    </a>`: ''}
                    ${embed.footer ? `
                    <div class="embedFooter">
                        ${embed.footer.iconURL ? `
                        <img class="embedFooterIcon" src="${embed.footer.iconURL}" alt="Icone footer">`:''}
                        ${embed.footer.text ? `
                        <span class="embedAuthorText">${embed.footer.text}</span>`:''}
                    </div>`:''}
                </div>\n`;
            })
        };

        fileContent+= `<div class="message group">
            <div class="contents">
                <img src="${message.author.avatarURL({ dynamic: true, size: 64, format: 'png' })}" class="avatar">
                <h2 class="header">
                    <span class="username" style="color: ${message.author.id == message.guild.me.id ? message.guild.me.displayHexColor : message.member?.displayHexColor ?? '#ffffff'}">${message.member?.nickname ?? message.author.username}</span>${message.author.bot ? `
                    <span class="botTag"> <span class="botText">BOT</span></span>`:''}
                    <span class="timestamp_header">${moment(message.createdTimestamp).calendar()}</span>
                </h2>
                <div class="messageContent">${messageContent}</div>
                <div class="container">
                    ${embeds}
                </div>
            </div>
        </div>`
    });

    let text = fs.readFileSync('./assets/scripts/htmlSaveText.txt').toString();
    text = text.replace('/CODE/', fileContent)
        .replace(/guild\.name/g, messages.first().guild.name)
        .replace(/channel\.name/g, messages.first().channel.name);

    fs.writeFileSync(`./assets/scripts/${customId}.html`, text);

    setTimeout(() => {
        fs.rmSync(`./assets/scripts/${customId}.html`);
    }, 10000);
};

module.exports = save;