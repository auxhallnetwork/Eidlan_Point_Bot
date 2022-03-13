"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentBalance = void 0;
const balanceTb_1 = require("../database/balanceTb");
async function getCurrentBalance(userID, pool) {
    var point = await (0, balanceTb_1.getDbCurrentBalance)(userID, pool);
    if (point[0] === undefined) {
        return 0;
    }
    else
        return Number(point[0].cp);
}
exports.getCurrentBalance = getCurrentBalance;
