"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = exports.getStats = exports.sendPoints = exports.grantPoints = exports.getPoints = void 0;
// Get the amount of points a user has
async function getPoints(userID, pool) {
    const [rows] = await pool.execute(` SELECT  (SELECT COALESCE(SUM(points), 0) FROM points WHERE from_id = ?) AS points_from,
                                                        (SELECT COALESCE(SUM(points), 0) FROM points WHERE to_id = ?) AS points_to`, [userID, userID]);
    const total = rows[0].points_to - rows[0].points_from;
    return {
        total,
        points_to: rows[0].points_to,
        points_from: rows[0].points_from,
    };
}
exports.getPoints = getPoints;
// Grant points to a user
function grantPoints(granter, target, points, pool) {
    return pool.execute("INSERT INTO points (type, caller_id, caller_username, to_id, to_username, points) VALUES(?, ?, ?, ?, ?, ?)", ["Grant", granter.id, granter.username, target.id, target.username, points]);
}
exports.grantPoints = grantPoints;
// Send points from one user to another
function sendPoints(sender, target, points, pool) {
    return pool.execute("INSERT INTO points (type, caller_id, caller_username, from_id, from_username, to_id, to_username, points) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [
        "Send",
        sender.id,
        sender.username,
        sender.id,
        sender.username,
        target.id,
        target.username,
        points,
    ]);
}
exports.sendPoints = sendPoints;
// Get the total points granted, total times granted and total users granted
async function getStats(pool) {
    const [rows] = await pool.execute(`SELECT SUM(points) AS points, COUNT(*) AS grants, COUNT(DISTINCT to_id) AS users FROM points WHERE type = 'grant'`);
    const stats = rows[0];
    return stats;
}
exports.getStats = getStats;
// Get the top N users by point holdings
async function getLeaderboard(limit, pool) {
    const [rows] = await pool.execute(` SELECT  t.userID, t.points - COALESCE(f.points, 0) AS points
      FROM (SELECT to_id AS userID, SUM(points)
      AS points FROM points GROUP BY 1) AS t
      LEFT JOIN (SELECT from_id AS userID, SUM(points)
      AS points FROM points GROUP BY 1) AS f ON  t.userID = f.userID
      ORDER BY 2 DESC
      LIMIT ?`, 
    // Convert to string to fix "Incorrect arguments to mysqld_stmt_execute" error
    // See https://github.com/sidorares/node-mysql2/issues/1239
    [String(limit)]);
    return rows;
}
exports.getLeaderboard = getLeaderboard;
