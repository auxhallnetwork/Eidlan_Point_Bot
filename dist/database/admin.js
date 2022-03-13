"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdmins = exports.removeAdmin = exports.addAdmin = exports.isAdmin = void 0;
// Check if user is in admin list
async function isAdmin(userID, pool) {
    const [rows] = await pool.execute("SELECT * FROM admins WHERE id=?", [userID]);
    if (!Array.isArray(rows)) {
        return false;
    }
    return rows.length > 0;
}
exports.isAdmin = isAdmin;
// Add user to admin list
async function addAdmin(caller, target, pool) {
    return pool.execute("INSERT INTO admins (id, username, by_id, by_username) VALUES(?, ?, ?, ?)", [target.id, target.username, caller.id, caller.username]);
}
exports.addAdmin = addAdmin;
// Remove user from admin list
async function removeAdmin(userID, pool) {
    return pool.execute("DELETE FROM admins WHERE id = ?", [userID]);
}
exports.removeAdmin = removeAdmin;
// Get the list of admins
async function listAdmins(pool) {
    const [rows] = await pool.execute(`SELECT * FROM admins ORDER BY created DESC`);
    if (!Array.isArray(rows)) {
        return;
    }
    return rows;
}
exports.listAdmins = listAdmins;
