"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersBeforePoints = void 0;
const discord_js_1 = require("discord.js");
// Get the users mentioned before the points argument
// e.g. in "!send @user1 10 points for helping @user2",
// Only take "@user1" as the command target
function getUsersBeforePoints(message) {
    const match = message.content.match(/ [0-9]+/);
    if (!match) {
        // Return no users if points could not be found
        return new discord_js_1.Collection();
    }
    const points = match[0];
    const pointsIndex = message.content.indexOf(points);
    const slicedContent = message.content.slice(pointsIndex);
    return message.mentions.users.filter((user) => {
        if (slicedContent.includes(user.id)) {
            return false;
        }
        return true;
    });
}
exports.getUsersBeforePoints = getUsersBeforePoints;
