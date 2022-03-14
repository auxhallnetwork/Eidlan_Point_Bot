"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbCurrentBalance = exports.updateBalance = void 0;
async function updateBalance(userID, username, point, pool) {
    var current_point_balance = await getDbCurrentBalance(userID, pool);
    if (current_point_balance[0] === undefined) {
        pool.execute("INSERT INTO balance (UserId, current_points,username) VALUES(?, ?, ?)", [userID, point, username]);
    }
    else {
        point += Number(current_point_balance[0].cp);
    }
    return pool.execute("UPDATE  balance SET current_points=? WHERE UserId = ?", [point, userID]);
}
exports.updateBalance = updateBalance;
async function getDbCurrentBalance(userID, pool) {
    const [rows] = await pool.execute(` SELECT current_points as cp FROM balance WHERE UserId = ?`, [userID]);
    return rows;
}
exports.getDbCurrentBalance = getDbCurrentBalance;
