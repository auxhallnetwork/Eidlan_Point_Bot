"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const config_1 = require("../config");
class BotInhibitor extends discord_akairo_1.Inhibitor {
    constructor() {
        super("bot", {
            reason: "bot",
        });
    }
    exec(message) {
        // Ignore non-trusted bots
        return !config_1.TRUSTED_BOTS.includes(message.author.id) && message.author.bot;
    }
}
exports.default = BotInhibitor;
