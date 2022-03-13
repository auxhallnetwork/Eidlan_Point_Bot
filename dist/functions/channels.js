"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelType = exports.getChannelByType = void 0;
const constants_1 = require("../constants");
function getChannelByType(guild, type) {
    return guild.channels.cache.find((channel) => getChannelType(channel) === type);
}
exports.getChannelByType = getChannelByType;
function getChannelType(channel) {
    const isTextChannel = channel.type === "text";
    if (channel.type === "dm" ||
        (isTextChannel &&
            constants_1.POINTS_CHECKING_CHANNELS.some((checkingChannel) => channel.name.includes(checkingChannel)))) {
        return "checking";
    }
    const isNormalLogChannel = isTextChannel && channel.name.includes(constants_1.NORMAL_LOG_CHANNEL);
    const isMainLocalLogChannel = isTextChannel && channel.name.includes(constants_1.MAIN_LOCAL_LOG_CHANNEL);
    const isMainGrantsLogChannel = isTextChannel && channel.name.includes(constants_1.MAIN_GRANTS_LOG_CHANNEL);
    const isPrivateGrant = isTextChannel && channel.name.includes(constants_1.PRIVATE_GRANT_POINT_CHANNEL);
    if (isNormalLogChannel && !isMainGrantsLogChannel && !isMainLocalLogChannel && !isPrivateGrant) {
        return "log-normal";
    }
    if (isMainLocalLogChannel) {
        return "log-main-local";
    }
    if (isMainGrantsLogChannel) {
        return "log-main-grants";
    }
    if (isPrivateGrant)
        return "private-grant";
    return "unknown";
}
exports.getChannelType = getChannelType;
