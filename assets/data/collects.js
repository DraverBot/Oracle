const { Collection } = require('discord.js');

module.exports = {
    errors: new Collection(),
    errorsOnInvalidArg: new Collection(),
    cooldowns: new Collection(),
    specificCooldowns: new Collection()
};