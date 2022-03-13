"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
class ReadyListener extends discord_akairo_1.Listener {
    constructor() {
        super("ready", {
            emitter: "client",
            event: "ready",
        });
    }
    async exec() {
        console.log(`Logged in as ${this.client.user.tag}!`);
    }
}
exports.default = ReadyListener;
