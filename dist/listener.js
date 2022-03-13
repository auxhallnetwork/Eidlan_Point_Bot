"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomListener = void 0;
const discord_akairo_1 = require("discord-akairo");
class CustomListener extends discord_akairo_1.Listener {
    constructor(id, options) {
        super(id, options);
    }
    async exec(...args) {
        try {
            await this.listenerExec(...args);
        }
        catch (err) {
            console.warn(err);
        }
    }
}
exports.CustomListener = CustomListener;
