"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACHIEVEMENT_LOG = exports.PRIVATE_GRANT_POINT_CHANNEL = exports.MAIN_LOCAL_LOG_CHANNEL = exports.MAIN_GRANTS_LOG_CHANNEL = exports.NORMAL_LOG_CHANNEL = exports.POINTS_CHECKING_CHANNELS = void 0;
// All guilds
// For !points and !leaderboard
exports.POINTS_CHECKING_CHANNELS = [
    "check-your-eid-points",
    "check-your-eid-ᵽoints",
];
// All guilds
// In the main guild: logs everything from all guilds
// In non-main guilds: logs sends made inside that guild
exports.NORMAL_LOG_CHANNEL = "points-log";
// Main guild only
// Only logs grants from all guilds
exports.MAIN_GRANTS_LOG_CHANNEL = "grant-logs";
// Main guild only
// Only logs grants and sends made inside the main guild
exports.MAIN_LOCAL_LOG_CHANNEL = "point-logs";
//private channel
//grant points only for admins
exports.PRIVATE_GRANT_POINT_CHANNEL = "admin-grants";
//achievement- log channel
exports.ACHIEVEMENT_LOG = "achievement-logs";
