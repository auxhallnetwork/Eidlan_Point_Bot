"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNonAdminMessage = exports.createAdminMessage = exports.nonMainGuild = exports.mainGuild = exports.NON_MAIN_CHANNELS = exports.MAIN_CHANNELS = exports.nonAdminUser2 = exports.nonAdminUser = exports.adminUser = void 0;
const sinon_1 = __importDefault(require("sinon"));
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
exports.adminUser = {
    id: "admin_id",
    username: "admin_username",
    toString() {
        return `<@${this.id}>`;
    },
    send: sinon_1.default.stub(),
};
exports.nonAdminUser = {
    id: "non_admin_id",
    username: "non_admin_username",
    toString() {
        return `<@${this.id}>`;
    },
    send: sinon_1.default.stub(),
};
exports.nonAdminUser2 = {
    id: "non_admin2_id",
    username: "non_admin2_username",
    toString() {
        return `<@${this.id}>`;
    },
    send: sinon_1.default.stub(),
};
exports.MAIN_CHANNELS = {
    log: "main_guild_log",
    checking: "main_guild_checking",
    grants: "main_guild_grants",
    local: "main_guild_local",
};
exports.NON_MAIN_CHANNELS = {
    log: "non_main_guild_log",
    checking: "non_main_guild_checking",
    grants: "non_main_guild_grants",
    local: "non_main_guild_local",
};
exports.mainGuild = {
    id: config_1.MAIN_GUILD,
    channels: {
        cache: new discord_js_1.Collection(),
    },
    members: {
        cache: new discord_js_1.Collection(),
    },
};
exports.mainGuild.channels.cache.set(exports.MAIN_CHANNELS.log, {
    name: "🧾points-log",
    type: "text",
    send: sinon_1.default.stub(),
});
exports.mainGuild.channels.cache.set(exports.MAIN_CHANNELS.checking, {
    name: "🏧check-your-ᵽoints",
    type: "text",
    send: sinon_1.default.stub(),
});
exports.mainGuild.channels.cache.set(exports.MAIN_CHANNELS.grants, {
    name: "grants-log",
    type: "text",
    send: sinon_1.default.stub(),
});
exports.mainGuild.channels.cache.set(exports.MAIN_CHANNELS.local, {
    name: "eco-server-points-log",
    type: "text",
    send: sinon_1.default.stub(),
});
exports.nonMainGuild = {
    id: "non_main_guild",
    channels: {
        cache: new discord_js_1.Collection(),
    },
    members: {
        cache: new discord_js_1.Collection(),
    },
};
exports.nonMainGuild.channels.cache.set(exports.NON_MAIN_CHANNELS.log, {
    name: "points-log",
    type: "text",
    send: sinon_1.default.stub(),
});
exports.nonMainGuild.channels.cache.set(exports.NON_MAIN_CHANNELS.checking, {
    name: "check-your-points",
    type: "text",
    send: sinon_1.default.stub(),
});
exports.nonMainGuild.channels.cache.set(exports.NON_MAIN_CHANNELS.grants, {
    name: "grants-log",
    type: "text",
    send: sinon_1.default.stub(),
});
exports.nonMainGuild.channels.cache.set(exports.NON_MAIN_CHANNELS.local, {
    name: "eco-server-points-log",
    type: "text",
    send: sinon_1.default.stub(),
});
function createAdminMessage(client) {
    const message = {
        author: exports.adminUser,
        mentions: {
            users: new discord_js_1.Collection(),
        },
        react: sinon_1.default.stub(),
        reply: sinon_1.default.stub(),
        guild: exports.mainGuild,
        deleted: false,
        deletable: true,
        delete: sinon_1.default.stub().returns({
            catch: sinon_1.default.stub(),
        }),
        client,
    };
    return message;
}
exports.createAdminMessage = createAdminMessage;
function createNonAdminMessage(client) {
    return Object.assign(Object.assign({}, createAdminMessage(client)), { author: exports.nonAdminUser });
}
exports.createNonAdminMessage = createNonAdminMessage;
