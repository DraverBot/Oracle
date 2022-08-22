const { gs } = require('../../assets/data/data.json')
const emojis = require('../../assets/data/emojis.json')
const functions = require('../../assets/functions');

const package = functions.package();

const fs = require('fs')
const Discord = require('discord.js');
const moment = require('moment')
moment.locale('fr');
const ms = require('ms');

module.exports.run = async (message, args, client, prefix) => {
    if (message.author.id !== gs) return
    
    const content = args.join(' ');
        const result = new Promise((resolve, reject) => resolve(eval(content)));
        return result.then((output) => {
            if (typeof output !== 'string') output = require('util').inspect(output, { depth: 0 });
            if (output.includes(token)) output = output.replace(token, 'T0K3N');
            return message.channel?.send({ content: `\`\`\`${output}\`\`\`` });
        }).catch(err => {
            if (err) {
                err = err.toString();
                return message.channel?.send({ content: `\`\`\`${err}\`\`\`` })
            }
        });
}

module.exports.help = {
    name:"eval",
    private: true,
    exemples:["isNaN('-31');", "message.channel.send('Hello');"],
    description: "Éxecute le code passé en arguments. Renvoie \`undefined\` si il n'y a pas de sortie",
    cooldown: 5,
    aliases:[],
    dm: true,
    permissions: []
}