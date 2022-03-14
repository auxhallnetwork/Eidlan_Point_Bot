"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoles = void 0;
async function getRoles(point, pool) {
    const [rows] = await pool.execute(` SELECT RoleId as id , Min as min, EMoji as emoji FROM role  ORDER BY Min DESC`);
    return rows;
}
exports.getRoles = getRoles;
