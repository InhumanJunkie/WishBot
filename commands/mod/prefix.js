let utils = require('./../../utils/utils.js'),
    Database = require('./../../utils/Database.js');

module.exports = {
    usage: 'Prints out the current command prefix.',
    delete: true,
    togglable: false,
    cooldown: 20,
    process: (bot, msg, suffix) => {
        Database.changePrefix(msg.channel.guild, suffix).then(() => {
            bot.createMessage(msg.channel.id, "📋 Successfully changed prefix to `" + suffix + "` 📋").catch();
        }).catch(err => {
            console.log(errorC(err))
            bot.createMessage(msg.channel.id, "⛔ " + err + " ⛔").catch();
        })
    }
}