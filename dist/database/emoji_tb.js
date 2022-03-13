"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmoji = void 0;
async function getEmoji(pool) {
    const [rows] = await pool.execute(` SELECT Symbol as emoji FROM Emoji `);
    if (rows[0] === undefined) {
        return "<:EidlandCoins:951246267105820752>";
    }
    return rows[0].emoji.toString();
}
exports.getEmoji = getEmoji;
