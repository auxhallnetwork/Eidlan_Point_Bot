"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRoles = void 0;
const roleTb_1 = require("../database/roleTb");
const constants_1 = require("../constants");
// Set a user's roles according to the amount of points they have
async function setRoles(userID, guild, points, pool, client) {
    // Disable if not configured
    var reply;
    var role_level = await (0, roleTb_1.getRoles)(points, pool);
    if (role_level[0] === undefined) {
        return;
    }
    try {
        // Ignore DMs, guild data aren't available
        if (!guild) {
            return;
        }
        const guildMember = guild.members.cache.get(userID);
        if (!guildMember) {
            return;
        }
        let roleId = "";
        // Sort roles in descending order
        //const roleLevels = ROLE_LEVELS.sort((a, b) => b.min - a.min)
        // Add a new role that matches the amount of points
        for (let i = 0; role_level[i] != undefined; i++) {
            console.log(role_level[i].min + " points " + points);
            if (points >= role_level[i].min) {
                roleId = role_level[i].id;
                if (!guildMember.roles.cache.find(ch => ch.name === roleId)) {
                    const role = guild.roles.cache.find(ch => ch.name === roleId);
                    if (role) {
                        guildMember.roles.add(role).catch(console.warn);
                        const roleLogeChannel = guild.channels.cache.find(ch => ch.name === constants_1.ACHIEVEMENT_LOG);
                        if (roleLogeChannel.isText()) {
                            if (role_level[i].emoji != undefined)
                                roleLogeChannel.send(`${guildMember} has earned a ${role} ${role_level[i].emoji}`);
                            else
                                roleLogeChannel.send(`${guildMember} has earned a ${role} `);
                        }
                    }
                    reply = true;
                }
                break;
            }
        }
        //Remove the old role if we added a new one
        for (let i = 0; role_level[i] != undefined; i++) {
            if (roleId !== role_level[i].id) {
                console.log("und");
                if (guildMember.roles.cache.find(ch => ch.name === role_level[i].id)) {
                    const role = guild.roles.cache.find(ch => ch.name === role_level[i].id);
                    console.log("und " + role);
                    if (role)
                        guildMember.roles.remove(role).catch(console.warn);
                }
            }
        }
    }
    catch (err) {
        console.warn(err);
    }
}
exports.setRoles = setRoles;
