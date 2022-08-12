const { run } = require('../assets/message');

module.exports = {
    event: 'messageCreate',
    execute: run
};