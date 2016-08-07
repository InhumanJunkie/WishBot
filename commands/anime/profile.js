let mysql = require('mysql'),
    options = require('./../../options/options.json'),
    utils = require('./../../utils/utils.js');

module.exports = {
    usage: "lots of documentaion, profile edit [name] || [status] || [birthday] || [age] || [location] || [animeplanet] || [hummingbird] || [myanimelist] || [twitch] || [bio]",
    delete: true,
    cooldown: 5,
    process: (bot, msg, suffix) => {
        if (suffix) {
            if (suffix.split(' ')[0].toLowerCase() === ('edit')) {
                editUser(msg.author, suffix.split(' ')[1].toLowerCase(), suffix.substring((6 + suffix.split(' ')[1].length), suffix.length))
                    .then(action => bot.createMessage(msg.channel.id, "Successfully " + action + ", **" + msg.author.username + "**-senpai"))
                    .catch(err => bot.createMessage(msg.channel.id, err));
            } else {
                msg.mentions.length === 1 ? user = msg.mentions[0] : user = utils.getName(msg, suffix);
                processProfile(bot, msg, user)
            }
        } else processProfile(bot, msg, msg.author);
    }
}

function editUser(user, edit, change) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT user_profile FROM user_settings WHERE user_id = ' + user.id, (err, rows) => {
            if (err) reject(err);
            else if (rows.length < 1) createUser(user).then(() => editUser(user, edit, change).then(action => resolve(action)).catch(err => reject(err)));
            else {
                let userProfile = JSON.parse(rows[0].user_profile);
                if (validateUrl(change)) reject('You cannot use a URL in your profile at this time.');
                else if (change.length <= 0 && (userProfile.hasOwnProperty(edit))) {
                    userProfile[edit] = null;
                    saveUser(user, userProfile).then(() => resolve('cleared `' + edit + '`'));
                } else if (edit === "name") {
                    if (change.length <= 32) {
                        userProfile.name = change;
                        saveUser(user, userProfile).then(() => resolve('edited `name`'));
                    } else reject('Name can only be 32 characters or less');
                } else if (edit === "status") {
                    if (change.length <= 64) {
                        userProfile.status = change;
                        saveUser(user, userProfile).then(() => resolve('edited `status`'));
                    } else reject('Status can only be 64 characters or less');
                } else if (edit === "birthday") {
                    if (/[\uD000-\uF8FF]/g.test(change)) reject('Birthday included illegal chracters');
                    else if (change.length <= 16) {
                        userProfile.birthday = change;
                        saveUser(user, userProfile).then(() => resolve('edited `birthday`'));
                    } else reject('Status can only be 16 characters or less');
                } else if (edit === "age") {
                    if (!/^\d+$/.test(change)) reject('Age included illegal chracters');
                    else if (change.length <= 8) {
                        userProfile.age = change;
                        saveUser(user, userProfile).then(() => resolve('edited `age`'));
                    } else reject('Age can only be 8 characters or less');
                } else if (edit === "location") {
                    if (!convertFromCountry(change) || !/[\uD000-\uF8FF]/g.test(change)) reject('Location included illegal chracters');
                    else if (change.length <= 4) {
                        userProfile.location = convertFromCountry(change);
                        saveUser(user, userProfile).then(() => resolve('edited `location`'));
                    } else reject('Age can only be 4 characters or less');
                } else if (edit === "animeplanet") {
                    if (/[\uD000-\uF8FF]/g.test(change)) reject('Anime Planet username included illegal chracters');
                    else if (change.length <= 20 && change.length >= 3) {
                        userProfile.animeplanet = change;
                        saveUser(user, userProfile).then(() => resolve('edited `animePlanet`'));
                    } else reject('Anime Planet username can only be 20 characters or less');
                } else if (edit === "hummingbird") {
                    if (/[\uD000-\uF8FF]/g.test(change)) reject('Hummingbird username included illegal chracters');
                    else if (change.length <= 20 && change.length >= 3) {
                        userProfile.animeplanet = change;
                        saveUser(user, userProfile).then(() => resolve('edited `hummingbird`'));
                    } else reject('Hummingbird username can only be 20 characters or less');
                } else if (edit === "myanimelist") {
                    if (/[\uD000-\uF8FF]/g.test(change)) reject('MyAnimeList username included illegal chracters');
                    else if (change.length <= 16 && change.length >= 2) {
                        userProfile.animeplanet = change;
                        saveUser(user, userProfile).then(() => resolve('edited `myAnimeList`'));
                    } else reject('MyAnimeList username can only be 16 characters or less');
                } else if (edit === "twitch") {
                    if (/[\uD000-\uF8FF]/g.test(change)) reject('Twitch username included illegal chracters');
                    else if (change.length <= 25) {
                        userProfile.twitch = change;
                        saveUser(user, userProfile).then(() => resolve('edited `twitch`'));
                    } else reject('Twitch username can only be 25 characters or less');
                } else if (edit === "bio") {
                    if (change.length <= 1000) {
                        userProfile.bio = change;
                        saveUser(user, userProfile).then(() => resolve('edited `bio`'));
                    } else reject('Bio can only be 1000 characters or less');
                } else reject("`" + edit + "` isn't an available option to edit.");
            }
        });
    });
}

function saveUser(user, userProfile) {
    return new Promise((resolve, reject) => {
        let data = {
            user_id: user.id,
            user_profile: JSON.stringify(userProfile)
        }
        pool.query('UPDATE user_settings SET ? WHERE user_id = ' + user.id, data, (err, res) => {
            if (err) console.log(err);
            else resolve();
        })
    });
}


function createUser(user) {
    return new Promise((resolve, reject) => {
        let user_default = {
            name: user.username,
            status: null,
            birthday: null,
            age: null,
            location: null,
            animeplanet: null,
            hummingbird: null,
            myanimelist: null,
            twitch: null,
            bio: null
        };
        let data = {
            user_id: user.id,
            user_profile: JSON.stringify(user_default)
        }
        pool.query('INSERT INTO user_settings SET ?', data, (err, res) => {
            if (err) reject(err);
            else resolve();
        })
    });
}

function processProfile(bot, msg, person) {
    let msgArray = [`__**Profile for ${person.username}**__`];
    pool.query('SELECT * FROM user_settings WHERE user_id = ' + person.id, (err, rows) => {
        if (err) console.log(errorC('Error while performing Query'));
        else if (rows.length < 1) {
            msgArray.push(`📝 **Name:** ${person.username}`);
        } else if (rows.length === 1) {
            let user = JSON.parse(rows[0].user_profile);
            if (user.name != null) msgArray.push(`📝 **Name:** ${user.name}`);
            if (user.status != null) msgArray.push(`🖊 **Status:** ${user.status}`);
            if (user.birthday != null) msgArray.push(`🎉 **Birthday:** ${user.birthday}`);
            if (user.age != null) msgArray.push(`🎂 **Age:** ${user.age}`);
            if (user.location != null) msgArray.push(`🌎 **Location:** ${convertToCountry(user.location)}`);
            if (user.animeplanet != null) msgArray.push(`🔖 **Anime Planet:** ${user.animeplanet}`);
            if (user.hummingbird != null) msgArray.push(`📘 **Hummingbird:** ${user.hummingbird}`);
            if (user.myanimelist != null) msgArray.push(`📕 **myAnimeList:** ${user.myanimelist}`);
            if (user.twitch != null) msgArray.push(`🎮 **Twitch:** ${user.twitch}`);
            if (user.bio != null) msgArray.push(`📚 **Bio:** ${user.bio}`);
        }
        bot.createMessage(msg.channel.id, msgArray.join('\n'));
    })
}

function convertToCountry(country_code) {
    let OFFSET = 127397;
    let cc = country_code.toUpperCase();
    return (/^[A-Z]{2}$/.test(cc)) ? String.fromCodePoint(...[...cc].map(c => c.charCodeAt() + OFFSET)) : null;
}

function convertFromCountry(country_code) {
    let OFFSET = 127397;
    return String.fromCharCode(...[...country_code].map(c => c.codePointAt() - OFFSET));
}

function validateUrl(value) {
    return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
}
