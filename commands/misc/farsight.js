const { reply } = require('../../assets/functions');

module.exports.help = {
    name: 'farsight',
    appear: false,
    dm: true,
    private: false,
    cooldown: 5
}

module.exports.run = (message) => {
    return reply(message.id, message.channel, `Farsight leader of the rebels\nhttps://tenor.com/commander-farsight-warhammer40k-tau-empire-tau-gif-16294167`, false);
}