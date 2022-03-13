"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMainGuild = exports.getMainGuild = void 0;
const config_1 = require("../config");
// Get the main guild (logs transfers from all guilds)
function getMainGuild(client) {
    const guildCache = client.guilds.cache;
    const guild = guildCache.find((guild) => guild.id === config_1.MAIN_GUILD);
    if (guild) {
        return guild;
    }
    else {
        console.warn(`Main guild ${config_1.MAIN_GUILD} not found`);
    }
}
exports.getMainGuild = getMainGuild;
function isMainGuild(guild, client) {
    var _a;
    return guild.id === ((_a = getMainGuild(client)) === null || _a === void 0 ? void 0 : _a.id);
}
exports.isMainGuild = isMainGuild;
