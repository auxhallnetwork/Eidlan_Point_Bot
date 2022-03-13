"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
class PingCommand extends discord_akairo_1.Command {
    constructor() {
        super("ping", {
            aliases: ["ping"],
            cooldown: 3000,
            ratelimit: 2,
        });
    }
    async exec(message) {
        await message.reply(`ping (${Date.now() - message.createdTimestamp}ms)`);
    }
}
exports.default = PingCommand;
