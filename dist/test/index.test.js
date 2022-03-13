"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const sinon_1 = __importDefault(require("sinon"));
const admin_1 = __importDefault(require("../commands/admin"));
const grant_1 = __importDefault(require("../commands/grant"));
const send_1 = __importDefault(require("../commands/send"));
const points_1 = __importDefault(require("../commands/points"));
const leaderboard_1 = __importDefault(require("../commands/leaderboard"));
const trusted_bots_1 = __importDefault(require("../inhibitors/trusted_bots"));
const client_1 = require("../client");
const discord_js_1 = require("discord.js");
const admin_2 = require("../database/admin");
const test_util_test_1 = require("./test_util.test");
const points_2 = require("../database/points");
const config_1 = require("../config");
const discord_mocks_test_1 = require("./discord_mocks.test");
const axios_1 = __importDefault(require("axios"));
const axiosStub = sinon_1.default.stub(axios_1.default, "post");
let pool;
const CLIENT_ID = "client_Id";
const client = new client_1.Accountant(pool);
/// @ts-expect-error
client.user = {
    id: CLIENT_ID,
};
const adminCommand = new admin_1.default();
const grantCommand = new grant_1.default();
const sendCommand = new send_1.default();
const pointsCommand = new points_1.default();
const leaderboardCommand = new leaderboard_1.default();
const botInhibitor = new trusted_bots_1.default();
before(() => {
    pool = (0, test_util_test_1.createTestDatabasePool)();
    client.pool = pool;
    /// @ts-expect-error
    client.guilds.cache.set(config_1.MAIN_GUILD, discord_mocks_test_1.mainGuild);
    /// @ts-expect-error
    client.guilds.cache.set(discord_mocks_test_1.nonMainGuild.id, discord_mocks_test_1.nonMainGuild);
    adminCommand.client = client;
    grantCommand.client = client;
    sendCommand.client = client;
});
after(async () => {
    await pool.end();
    client.destroy();
});
beforeEach(async () => {
    // Reset the database before every test case
    // They should not rely on any previous state
    await (0, test_util_test_1.dropAndCreateTables)(pool);
    // Set adminUser as admin
    await (0, admin_2.addAdmin)(discord_mocks_test_1.adminUser, discord_mocks_test_1.adminUser, pool);
    // Reset all stubs
    sinon_1.default.reset();
});
describe("Admin commands", () => {
    it("adds a new admin", async () => {
        const target = discord_mocks_test_1.nonAdminUser;
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        adminMessage.mentions.users.set(target.id, target);
        /// @ts-expect-error
        await adminCommand.exec(adminMessage, { command: "add" });
        // Target should be in admin list
        const targetIsAdmin = await (0, admin_2.isAdmin)(target.id, pool);
        (0, assert_1.default)(targetIsAdmin);
    });
    it("removes an admin", async () => {
        const target = discord_mocks_test_1.nonAdminUser;
        // Set target as admin
        await (0, admin_2.addAdmin)(discord_mocks_test_1.adminUser, target, pool);
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        adminMessage.mentions.users.set(target.id, target);
        /// @ts-expect-error
        await adminCommand.exec(adminMessage, { command: "remove" });
        // Target should not be in admin list
        const targetIsNotAdmin = !(await (0, admin_2.isAdmin)(target.id, pool));
        (0, assert_1.default)(targetIsNotAdmin);
    });
    it("lists the admins", async () => {
        const admin = discord_mocks_test_1.adminUser;
        const admin2 = discord_mocks_test_1.nonAdminUser;
        await (0, admin_2.addAdmin)(discord_mocks_test_1.adminUser, admin2, pool);
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        /// @ts-expect-error
        await adminCommand.exec(adminMessage, { command: "list" });
        const reply = adminMessage.reply.args[0][0];
        (0, assert_1.default)(typeof reply === "string");
        // Should mention the admins
        (0, assert_1.default)(reply.includes(admin.id));
        (0, assert_1.default)(reply.includes(admin2.id));
    });
    it("displays grant stats", async () => {
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, discord_mocks_test_1.nonAdminUser, amount, pool);
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, discord_mocks_test_1.nonAdminUser, amount, pool);
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, discord_mocks_test_1.nonAdminUser2, amount, pool);
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        /// @ts-expect-error
        await adminCommand.exec(adminMessage, { command: "stats" });
        const reply = adminMessage.reply.args[0][0];
        (0, assert_1.default)(typeof reply === "string");
        // Should display the total amount granted
        (0, assert_1.default)(reply.includes(String(amount * 3)));
        // Should display the total number of grants
        (0, assert_1.default)(reply.includes(String(3)));
        // Should display the total amount of users granted
        (0, assert_1.default)(reply.includes(String(2)));
    });
});
describe("Protecting admin commands", () => {
    it("does not allow a non-admin to use any of the !admin commands (even with admin perms)", async () => {
        const nonAdminMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        nonAdminMessage.member = {
            permissions: new discord_js_1.Permissions(discord_js_1.Permissions.FLAGS.ADMINISTRATOR),
        };
        // Caller has admin perms
        (0, assert_1.default)(nonAdminMessage.member.permissions.has(discord_js_1.Permissions.FLAGS.ADMINISTRATOR));
        const commands = ["add", "remove", "list", "stats"];
        const results = await Promise.all(commands.map((command) => {
            /// @ts-expect-error
            return adminCommand.exec(nonAdminMessage, {
                command,
            });
        }));
        // All commands should be rejected
        assert_1.default.deepStrictEqual(results, [
            "NOT_ADMIN",
            "NOT_ADMIN",
            "NOT_ADMIN",
            "NOT_ADMIN",
        ]);
    });
    it("does not allow a non-admin to add new admins", async () => {
        const target = discord_mocks_test_1.nonAdminUser2;
        const nonAdminMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        nonAdminMessage.mentions.users.set(target.id, target);
        // Attempt to add targetID to list of admins
        /// @ts-expect-error
        const result = await adminCommand.exec(nonAdminMessage, { command: "add" });
        assert_1.default.strictEqual(result, "NOT_ADMIN");
        // Target should not be in admin list
        const targetIsAdmin = await (0, admin_2.isAdmin)(target.id, pool);
        (0, assert_1.default)(!targetIsAdmin);
    });
    it("does not allow a non-admin to grant points (even with admin perms)", async () => {
        const nonAdminMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        nonAdminMessage.mentions.users.set(discord_mocks_test_1.nonAdminUser.id, discord_mocks_test_1.nonAdminUser);
        nonAdminMessage.member = {
            permissions: new discord_js_1.Permissions(discord_js_1.Permissions.FLAGS.ADMINISTRATOR),
        };
        // Caller has admin perms
        (0, assert_1.default)(nonAdminMessage.member.permissions.has(discord_js_1.Permissions.FLAGS.ADMINISTRATOR));
        /// @ts-expect-error
        const result = await grantCommand.exec(nonAdminMessage, { points: 100 });
        assert_1.default.strictEqual(result, "NOT_ADMIN");
        // Points should not have been granted
        const points = await (0, points_2.getPoints)(discord_mocks_test_1.nonAdminUser.id, pool);
        assert_1.default.strictEqual(points.total, 0);
        // Should return the "sorry" response
        (0, assert_1.default)(nonAdminMessage.reply.called);
    });
});
describe("Point transfers", () => {
    it("allows an admin to grant points to a single user", async () => {
        const target = discord_mocks_test_1.nonAdminUser;
        const amount = 100;
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        adminMessage.mentions.users.set(target.id, target);
        adminMessage.content = `!grant <@${target.id}> ${amount} points>`;
        /// @ts-expect-error
        await grantCommand.exec(adminMessage, { points: amount });
        const points = await (0, points_2.getPoints)(target.id, pool);
        // Target should have the points
        assert_1.default.strictEqual(points.total, amount);
    });
    it("allows an admin to grant points to multiple users", async () => {
        const target = discord_mocks_test_1.nonAdminUser;
        const target2 = discord_mocks_test_1.nonAdminUser2;
        const amount = 100;
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        adminMessage.mentions.users.set(target.id, target);
        adminMessage.mentions.users.set(target2.id, target2);
        adminMessage.content = `!grant <@${target.id}> <@${target2.id}> ${amount} points>`;
        /// @ts-expect-error
        await grantCommand.exec(adminMessage, { points: amount });
        const points = await (0, points_2.getPoints)(target.id, pool);
        const points2 = await (0, points_2.getPoints)(target2.id, pool);
        // Targets should have the points
        assert_1.default.strictEqual(points.total, amount);
        assert_1.default.strictEqual(points2.total, amount);
    });
    it("allows a user to send points to another user", async () => {
        const sender = discord_mocks_test_1.nonAdminUser;
        const target = discord_mocks_test_1.nonAdminUser2;
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, sender, amount, pool);
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        senderMessage.mentions.users.set(target.id, target);
        senderMessage.content = `!send <@${target.id}> ${amount} points>`;
        /// @ts-expect-error
        await sendCommand.exec(senderMessage, { points: amount });
        /// Sender should have exactly 0 points left
        const senderPoints = await (0, points_2.getPoints)(sender.id, pool);
        assert_1.default.strictEqual(senderPoints.total, 0);
        /// Target should have the points
        const targetPoints = await (0, points_2.getPoints)(target.id, pool);
        assert_1.default.strictEqual(targetPoints.total, amount);
    });
    it("allows a user to send points to multiple users", async () => {
        const sender = discord_mocks_test_1.nonAdminUser;
        const target = discord_mocks_test_1.nonAdminUser2;
        const target2 = discord_mocks_test_1.adminUser;
        const amountToGrant = 200;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, sender, amountToGrant, pool);
        const amountToSend = 100;
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        senderMessage.mentions.users.set(target.id, target);
        senderMessage.mentions.users.set(target2.id, target2);
        senderMessage.content = `!send <@${target.id}> <@${target2.id}> ${amountToSend} points>`;
        /// @ts-expect-error
        await sendCommand.exec(senderMessage, { points: amountToSend });
        /// Sender should have exactly 0 points left
        const senderPoints = await (0, points_2.getPoints)(sender.id, pool);
        assert_1.default.strictEqual(senderPoints.total, 0);
        /// Each target should have 100 points each
        const targetPoints = await (0, points_2.getPoints)(target.id, pool);
        const targetPoints2 = await (0, points_2.getPoints)(target2.id, pool);
        assert_1.default.strictEqual(targetPoints.total, amountToSend);
        assert_1.default.strictEqual(targetPoints2.total, amountToSend);
    });
    it("does not allow a user to send points they don't have", async () => {
        const target = discord_mocks_test_1.nonAdminUser2;
        const amount = 100;
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        senderMessage.mentions.users.set(target.id, target);
        senderMessage.content = `!send <@${target.id}> ${amount} points>`;
        /// @ts-expect-error
        const result = await sendCommand.exec(senderMessage, { points: amount });
        assert_1.default.strictEqual(result, "NOT_ENOUGH_POINTS");
        // Target should not have the points
        const points = await (0, points_2.getPoints)(target.id, pool);
        assert_1.default.strictEqual(points.total, 0);
    });
    it("does not allow a user to send points to themselves", async () => {
        const sender = discord_mocks_test_1.nonAdminUser;
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, discord_mocks_test_1.nonAdminUser, amount, pool);
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        senderMessage.mentions.users.set(sender.id, sender);
        senderMessage.content = `!send <@${sender.id}> ${amount} points>`;
        // Sender should have the same amount of points
        const points = await (0, points_2.getPoints)(sender.id, pool);
        assert_1.default.strictEqual(points.total, amount);
    });
    it("does not allow a user to send points to the bot", async () => {
        const sender = discord_mocks_test_1.nonAdminUser;
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, discord_mocks_test_1.nonAdminUser, amount, pool);
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        /// @ts-expect-error
        senderMessage.mentions.users.set(client.user.id, client.user);
        senderMessage.content = `!send <@${client.user.id}> ${amount} points>`;
        // Sender should have the same amount of points
        const points = await (0, points_2.getPoints)(sender.id, pool);
        assert_1.default.strictEqual(points.total, amount);
    });
    it("ignores users mentioned after the points argument (transfers)", async () => {
        const sender = discord_mocks_test_1.nonAdminUser;
        const target = discord_mocks_test_1.nonAdminUser2;
        const secondUser = discord_mocks_test_1.adminUser;
        const amountToGrant = 200;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, sender, amountToGrant, pool);
        const amountToSend = 100;
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        senderMessage.mentions.users.set(target.id, target);
        senderMessage.mentions.users.set(secondUser.id, secondUser);
        senderMessage.content = `!send <@${target.id}> ${amountToSend} points for helping <@${secondUser.id}>`;
        /// @ts-expect-error
        await sendCommand.exec(senderMessage, { points: amountToSend });
        // Sender should have 100 points left
        const senderPoints = await (0, points_2.getPoints)(sender.id, pool);
        assert_1.default.strictEqual(senderPoints.total, 100);
        // Target should have the points
        const targetPoints = await (0, points_2.getPoints)(target.id, pool);
        assert_1.default.strictEqual(targetPoints.total, amountToSend);
        // Second user should not have any points
        const secondUserPoints = await (0, points_2.getPoints)(secondUser.id, pool);
        assert_1.default.strictEqual(secondUserPoints.total, 0);
    });
    it("ignores users mentioned after the points argument (grants)", async () => {
        const target = discord_mocks_test_1.nonAdminUser;
        const secondUser = discord_mocks_test_1.nonAdminUser2;
        const amount = 100;
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        adminMessage.mentions.users.set(target.id, target);
        adminMessage.mentions.users.set(secondUser.id, secondUser);
        adminMessage.content = `!grant <@${target.id}> ${amount} points for helping <@${secondUser.id}>`;
        /// @ts-expect-error
        await grantCommand.exec(adminMessage, { points: amount });
        // Target should have the points
        const targetPoints = await (0, points_2.getPoints)(target.id, pool);
        assert_1.default.strictEqual(targetPoints.total, amount);
        // Second user should not have any points
        const secondUserPoints = await (0, points_2.getPoints)(secondUser.id, pool);
        assert_1.default.strictEqual(secondUserPoints.total, 0);
    });
    it("allows !send with no message", async () => {
        const sender = discord_mocks_test_1.nonAdminUser;
        const target = discord_mocks_test_1.nonAdminUser2;
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, sender, amount, pool);
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        senderMessage.mentions.users.set(target.id, target);
        senderMessage.content = `!send <@${target.id}> ${amount}`;
        /// @ts-expect-error
        await sendCommand.exec(senderMessage, { points: amount });
        /// Sender should have exactly 0 points left
        const senderPoints = await (0, points_2.getPoints)(sender.id, pool);
        assert_1.default.strictEqual(senderPoints.total, 0);
        /// Target should have the points
        const targetPoints = await (0, points_2.getPoints)(target.id, pool);
        assert_1.default.strictEqual(targetPoints.total, amount);
    });
});
describe("Logging", () => {
    it("logs main guild transfers to the right channels", async () => {
        const sender = discord_mocks_test_1.nonAdminUser;
        const target = discord_mocks_test_1.nonAdminUser2;
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, sender, amount, pool);
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        senderMessage.mentions.users.set(target.id, target);
        senderMessage.guild = discord_mocks_test_1.mainGuild;
        senderMessage.content = `!send <@${target.id} ${amount} points>`;
        /// @ts-expect-error
        await sendCommand.exec(senderMessage, { points: amount });
        // Should log in the main guild's log channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.log).send.called);
        // Should log in the main guild's local log channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.local).send.called);
        // Should not log in the non-main guild's log channel
        (0, assert_1.default)(discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.log).send.notCalled);
    });
    it("logs non-main guild transfers to the right channels", async () => {
        const sender = discord_mocks_test_1.nonAdminUser;
        const target = discord_mocks_test_1.nonAdminUser2;
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, sender, amount, pool);
        const senderMessage = (0, discord_mocks_test_1.createNonAdminMessage)();
        senderMessage.mentions.users.set(target.id, target);
        senderMessage.guild = discord_mocks_test_1.nonMainGuild;
        senderMessage.content = `!send <@${target.id} ${amount} points>`;
        /// @ts-expect-error
        await sendCommand.exec(senderMessage, { points: amount });
        // Should log in the main guild's log channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.log).send.called);
        // Should not log in the main guild's local log channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.local).send.notCalled);
        // Should log in the non-main guild's log channel
        (0, assert_1.default)(discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.log).send.called);
        // Should not log in the non-main guild's local log channel
        // Non-main guilds should not have this channel
        (0, assert_1.default)(discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.local).send.notCalled);
    });
    it("logs main guild grants to the right channels + slack", async () => {
        const target = discord_mocks_test_1.nonAdminUser;
        const amount = 100;
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        adminMessage.mentions.users.set(target.id, target);
        adminMessage.guild = discord_mocks_test_1.mainGuild;
        adminMessage.content = `!grant <@${target.id} ${amount} points>`;
        /// @ts-expect-error
        await grantCommand.exec(adminMessage, { points: amount });
        // Should log in the main guild's log channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.log).send.called);
        // Should log in the main guild's grants channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.grants).send.called);
        // Should log in the main guild's local log channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.local).send.called);
        // Should not log in the non-main guild's log channel
        (0, assert_1.default)(discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.log).send.notCalled);
        // Should not log in the non-main guild's grants channel
        // Non-main guilds should not have this channel
        (0, assert_1.default)(discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.grants).send.notCalled);
        // Should post to slack
        (0, assert_1.default)(axiosStub.called);
    });
    it("logs non-main guild grants to the right channels + slack", async () => {
        const target = discord_mocks_test_1.nonAdminUser;
        const amount = 100;
        const adminMessage = (0, discord_mocks_test_1.createAdminMessage)();
        adminMessage.mentions.users.set(target.id, target);
        adminMessage.guild = discord_mocks_test_1.nonMainGuild;
        adminMessage.content = `!grant <@${target.id} ${amount} points>`;
        /// @ts-expect-error
        await grantCommand.exec(adminMessage, { points: amount });
        // Should log in the main guild's log channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.log).send.called);
        // Should log in the main guild's grants channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.grants).send.called);
        // Should not log in the main guild's local log channel
        (0, assert_1.default)(discord_mocks_test_1.mainGuild.channels.cache.get(discord_mocks_test_1.MAIN_CHANNELS.local).send.notCalled);
        // Should not log in the non-main guild's log channel
        (0, assert_1.default)(discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.log).send.notCalled);
        // Should not log in the non-main guild's grants channel
        // Non-main guilds should not have this channel
        (0, assert_1.default)(discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.grants).send.notCalled);
        // Should post to slack
        (0, assert_1.default)(axiosStub.called);
    });
});
describe("Points checking", () => {
    it("replies with the user's points", async () => {
        const caller = discord_mocks_test_1.nonAdminUser;
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, caller, amount, pool);
        const callerMessage = (0, discord_mocks_test_1.createNonAdminMessage)(client);
        callerMessage.channel = discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.checking);
        /// @ts-expect-error
        await pointsCommand.exec(callerMessage, { user: caller });
        const reply = callerMessage.reply.args[0][0];
        (0, assert_1.default)(typeof reply === "string");
        // Should mention the caller
        (0, assert_1.default)(reply.includes(caller.id));
        // Should return the correct value
        (0, assert_1.default)(reply.includes(String(amount)));
    });
    it("displays another user's points", async () => {
        const target = discord_mocks_test_1.nonAdminUser2;
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, target, amount, pool);
        const callerMessage = (0, discord_mocks_test_1.createNonAdminMessage)(client);
        callerMessage.channel = discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.checking);
        /// @ts-expect-error
        await pointsCommand.exec(callerMessage, { user: target });
        const reply = callerMessage.reply.args[0][0];
        (0, assert_1.default)(typeof reply === "string");
        // Should mention the target
        (0, assert_1.default)(reply.includes(target.id));
        // Should return the correct value
        (0, assert_1.default)(reply.includes(String(amount)));
    });
    it("displays the leaderboard", async () => {
        const amount = 100;
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, discord_mocks_test_1.nonAdminUser, amount, pool);
        await (0, points_2.grantPoints)(discord_mocks_test_1.adminUser, discord_mocks_test_1.nonAdminUser2, amount, pool);
        const callerMessage = (0, discord_mocks_test_1.createNonAdminMessage)(client);
        callerMessage.channel = discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.checking);
        /// @ts-expect-error
        await leaderboardCommand.exec(callerMessage, { limit: 10 });
        const reply = callerMessage.reply.args[0][0];
        (0, assert_1.default)(typeof reply === "string");
        // Should mention the users
        (0, assert_1.default)(reply.includes(discord_mocks_test_1.nonAdminUser.id));
        (0, assert_1.default)(reply.includes(discord_mocks_test_1.nonAdminUser2.id));
        // Should display the correct value
        (0, assert_1.default)(reply.includes(String(amount)));
    });
    it("deletes the !points message if it's in the wrong channel", async () => {
        const caller = discord_mocks_test_1.nonAdminUser;
        const callerMessage = (0, discord_mocks_test_1.createNonAdminMessage)(client);
        callerMessage.channel = discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.log);
        /// @ts-expect-error
        const result = await pointsCommand.exec(callerMessage, {
            user: caller,
        });
        assert_1.default.strictEqual(result, "WRONG_CHANNEL");
        // Should delete the message
        (0, assert_1.default)(callerMessage.delete.called);
        // Should DM the user the reason why
        (0, assert_1.default)(caller.send.called);
    });
    it("deletes the !leaderboard message if it's in the wrong channel", async () => {
        const caller = discord_mocks_test_1.nonAdminUser;
        const callerMessage = (0, discord_mocks_test_1.createNonAdminMessage)(client);
        callerMessage.channel = discord_mocks_test_1.nonMainGuild.channels.cache.get(discord_mocks_test_1.NON_MAIN_CHANNELS.log);
        /// @ts-expect-error
        const result = await leaderboardCommand.exec(callerMessage, {
            user: caller,
        });
        assert_1.default.strictEqual(result, "WRONG_CHANNEL");
        // Should delete the message
        (0, assert_1.default)(callerMessage.delete.called);
        // Should DM the user the reason why
        (0, assert_1.default)(caller.send.called);
    });
});
describe("Trusted bots", () => {
    it("allows trusted bots to use commands", () => {
        if (!config_1.TRUSTED_BOTS[0]) {
            throw new Error("No trusted bots configured");
        }
        const botMessage = (0, discord_mocks_test_1.createNonAdminMessage)(client);
        botMessage.author.id = config_1.TRUSTED_BOTS[0];
        botMessage.author.bot = true;
        /// @ts-expect-error
        const result = botInhibitor.exec(botMessage);
        // Message was not blocked
        (0, assert_1.default)(!result);
    });
    it("does not allow non-trusted bots to use commands", () => {
        const botMessage = (0, discord_mocks_test_1.createNonAdminMessage)(client);
        botMessage.author.id = "12345";
        botMessage.author.bot = true;
        /// @ts-expect-error
        const result = botInhibitor.exec(botMessage);
        // Message was blocked
        (0, assert_1.default)(result);
    });
});
