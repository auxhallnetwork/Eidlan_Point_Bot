"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accountant = void 0;
const discord_akairo_1 = require("discord-akairo");
const path_1 = require("path");
const config_1 = require("./config");
class Accountant extends discord_akairo_1.AkairoClient {
    constructor(pool) {
        super();
        this.pool = pool;
        this.commandHandler = new discord_akairo_1.CommandHandler(this, {
            directory: (0, path_1.join)(__dirname, "commands"),
            prefix: config_1.PREFIX,
            blockBots: false,
        });
        this.listenerHandler = new discord_akairo_1.ListenerHandler(this, {
            directory: (0, path_1.join)(__dirname, "listeners"),
        });
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
        });
        this.inhibitorHandler = new discord_akairo_1.InhibitorHandler(this, {
            directory: (0, path_1.join)(__dirname, "inhibitors"),
        });
        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
        this.inhibitorHandler.loadAll();
    }
}
exports.Accountant = Accountant;
