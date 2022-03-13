"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const format_number_1 = require("../functions/format_number");
const admin_1 = require("../database/admin");
const sorry_1 = require("../functions/sorry");
const points_1 = require("../database/points");
const emoji_tb_1 = require("../database/emoji_tb");
class PointsCommand extends discord_akairo_1.Command {
    constructor() {
        super("admin", {
            aliases: ["admin"],
            category: "main",
            cooldown: 3000,
            ratelimit: 2,
            args: [
                {
                    id: "command",
                    type: "string",
                },
            ],
        });
    }
    async exec(message, args) {
        const pool = this.client.pool;
        const command = args.command;
        if (!command) {
            return;
        }
        // Check if caller is in admin list
        if (!(await (0, admin_1.isAdmin)(message.author.id, pool))) {
            return "NOT_ADMIN";
        }
        const users = message.mentions.users;
        if (command === "add" || command === "remove") {
            if (users.size === 0) {
                await (0, sorry_1.sorry)(message);
                return;
            }
            const user = users.first();
            const exists = await (0, admin_1.isAdmin)(user.id, pool);
            if (command === "add") {
                // Add user to admin list
                if (exists) {
                    await message.reply(`${user} is an admin already.`);
                    return;
                }
                await (0, admin_1.addAdmin)(message.author, user, pool);
                await message.reply(`${user} was added to the admins.`);
            }
            else if (command === "remove") {
                // Remove user from admin list
                if (!exists) {
                    await message.reply(`${user} is not an admin.`);
                    return;
                }
                await (0, admin_1.removeAdmin)(user.id, pool);
                await message.reply(`${user} was removed from the admins.`);
            }
        }
        else if (command === "list") {
            const rows = await (0, admin_1.listAdmins)(pool);
            let list = "";
            for (let i = 0; i < rows.length; i++) {
                list +=
                    // Add spaces to single digit rows (1-9)
                    // to make them line up with double digit rows (10+)
                    (i > 8 ? "\n" : "\n ") + (i + 1) + ". <@" + rows[i].id + ">";
            }
            await message.reply(`here is the list of admins: ${list}`);
        }
        else if (command === "stats") {
            const stats = await (0, points_1.getStats)(pool);
            await message.reply(`${await (0, emoji_tb_1.getEmoji)(pool)} ${(0, format_number_1.formatNumber)(stats.points)} granted, ${(0, format_number_1.formatNumber)(stats.grants)} grants, ${(0, format_number_1.formatNumber)(stats.users)} users`);
        }
    }
}
exports.default = PointsCommand;
