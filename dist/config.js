"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOT = exports.SLACK_WEBHOOK = exports.TRUSTED_BOTS = exports.ROLE_LEVELS = exports.POINTS_EMOTE = exports.PREFIX = exports.MAIN_GUILD = void 0;
// Main guild ID (logs transfers from all guilds)
exports.MAIN_GUILD = "903200944299331614";
// Prefix for commands
exports.PREFIX = "!";
// Text representation of the points emote used in bot messages
// You can get this by typing a backslash with the emote e.g. "\:points:"
// And it'll send it in this format
exports.POINTS_EMOTE = "<:EidlandCoins:951246267105820752>";
// IDs for custom roles and the minimum amount of points to acquire each
// e.g. "50-250 points" role for "min: 50",
// "250-1000 points" role for "min: 250"
// Providing an empty array disables this feature
exports.ROLE_LEVELS = [
    // { id: "", min: 5000 },
    // { id: "", min: 1000 },
    // { id: "", min: 250 },
    // { id: "", min: 50 },
    { id: "950809400728248360", min: 0 },
];
// (optional) Bot IDs allowed to interact with this bot
// All other bots will be ignored
exports.TRUSTED_BOTS = ["952610616265302038"];
// (optional) Slack webhook for logging grants
// https://api.slack.com/messaging/webhooks
exports.SLACK_WEBHOOK = "";
//bots id
exports.BOT = { id: "952610616265302038", username: "EidBot" };
