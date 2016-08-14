let dance = require('./../../lists/dance.json');

module.exports = {
    usage: "The bot dances around in the current channel using a random dance gif.",
    delete: true,
    cooldown: 5,
    process: (bot, msg) => {
        bot.createMessage(msg.channel.id, `🎶 💃 *Dances Around* 💃 🎶\n${dance[Math.floor(Math.random() * (dance.length))]}`).catch();
    }
}