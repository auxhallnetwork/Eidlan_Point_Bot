"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const client_1 = require("./client");
async function start() {
    const pool = promise_1.default.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: Number(process.env.DB_PORT),
    });
    const client = new client_1.Accountant(pool);
    client.login(process.env.BOT_TOKEN);
}
start().catch((err) => {
    console.warn(err);
    process.exit(1);
});
module.exports = start;
