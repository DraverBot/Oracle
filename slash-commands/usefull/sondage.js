const Discord = require('discord.js');
const functions = require('../../assets/functions');
const package = functions.package();

let options = [{name: 'question', type: 'STRING', required: true, description: "Question du sondage"}];
for (let i = 0; i < 10; i++) {
    options.push({
        name: `proposition_${i + 1}`,
        type: 'STRING',
        description: `Proposition ${i + 1} du sondage`,
        required: i < 2
    });
};

module.exports = {
    help: {
        cd: 5,
        dev: false,
        dm: false,
        systems: [],
        permissions: ['manage_guild']
    },
    configs: {
        name: 'sondage',
        description: "Fait un sondage",
        options
    },
    /**
     * @param {Discord.CommandInteraction} interaction 
     */
    run: async(interaction) => {
        let props = [];
        for (let i = 0; i < 10; i++) {
            props.push(interaction.options.get(`proposition_${i + 1}`)?.value);
        };
        props = props.filter(x => ![undefined, null].includes(x));

        const emojis = functions.getNumbersEmoji();
        emojis.splice(0, 1);
        emojis.splice(props.length, functions.getNumbersEmoji().length - props.length);
        
        const embed = package.embeds.classic(interaction.user)
            .setTitle("Sondage")
            .setDescription(`**${interaction.options.getString('question')}**\n\n${props.map((x, i) => `${emojis[i]} ${x}`).join('\n')}`)
            .setColor(('YELLOW'))
        
        await interaction.reply({ embeds: [ embed ] }).catch(() => {});
        const msg = await interaction.fetchReply();
        if (!msg) return;

        for (const emoji of emojis) {
            await msg.react(emoji).catch(() => {});
        };
    }
}