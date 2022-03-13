"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropAndCreateTables = exports.createTestDatabasePool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
function createTestDatabasePool() {
    return promise_1.default.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE_TEST,
        port: Number(process.env.DB_PORT),
        multipleStatements: true,
    });
}
exports.createTestDatabasePool = createTestDatabasePool;
async function dropAndCreateTables(pool) {
    const sql = await (0, promises_1.readFile)(path_1.default.join(__dirname, "..", "..", "db.sql"), "utf-8");
    return pool.query(sql);
}
exports.dropAndCreateTables = dropAndCreateTables;
