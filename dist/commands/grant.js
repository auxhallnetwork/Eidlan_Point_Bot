"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const points_1 = require("../database/points");
const set_roles_1 = require("../functions/set_roles");
const admin_1 = require("../database/admin");
const sorry_1 = require("../functions/sorry");
const logging_1 = require("../functions/logging");
const get_targets_1 = require("../functions/get_targets");
const balanceTb_1 = require("../database/balanceTb");
const getPoints_1 = require("../functions/getPoints");
const channels_1 = require("../functions/channels");
const emoji_tb_1 = require("../database/emoji_tb");
class GrantCommand extends discord_akairo_1.Command {
    constructor() {
        super("grant", {
            aliases: ["grant", "add", "award"],
            category: "main",
            cooldown: 3000,
            ratelimit: 2,
            args: [
                {
                    id: "points",
                    type: "number",
                    unordered: true,
                },
            ],
        });
    }
    async exec(message, args) {
        const pool = this.client.pool;
        const client = this.client;
        // Check if caller is in admin list
        if (!(await (0, admin_1.isAdmin)(message.author.id, pool))) {
            await (0, sorry_1.sorry)(message);
            return "NOT_ADMIN";
        }
        let checkAdmin = false;
        const checkingChannel = (0, channels_1.getChannelByType)(message.guild, "private-grant");
        try {
            if (!checkingChannel || (0, channels_1.getChannelType)(message.channel) !== "private-grant") {
                const errorMessage = `Your \`!grant\` command was removed from <#${message.channel.id}>. Please only post \`!grant\` in ${checkingChannel}. Thank you.`;
                await message.author.send(errorMessage);
                if (message.deletable && !message.deleted) {
                    await message.delete().catch((err) => console.warn(err));
                }
                return "WRONG_CHANNEL";
            }
        }
        catch (err) {
            console.warn(err);
        }
        const targets = (0, get_targets_1.getUsersBeforePoints)(message);
        await Promise.all(targets.map(async (user) => {
            checkAdmin = checkAdmin || await (0, admin_1.isAdmin)(user.id, pool);
        }));
        // Need at least one user and some points
        //var c = validateGrantCommand(message,targets.size)
        //console.log(c+" ccccc " + targets.size+" arg "+args.points)
        if (targets.size == 0 || args.points <= 0) {
            await message.reply("Incorrect number of arguments: !grant @user [number of Points].");
            return;
        }
        const botInTargets = targets.has(client.user.id);
        if (botInTargets) {
            await message.reply("You cannot grant me Points.");
            return "INVALID_ARGUMENTS";
        }
        const callerPoints = await (0, getPoints_1.getCurrentBalance)(client.user.id, pool);
        if (callerPoints < args.points * targets.size) {
            await message.reply(
            //`you only have ${POINTS_EMOTE}${formatNumber(callerPoints)}.`
            `Due to point defficiency, this grant is not possible`);
            return "NOT_ENOUGH_POINTS";
        }
        await Promise.all(targets.map(async (user) => {
            await (0, points_1.grantPoints)(client.user, user, args.points, pool);
            await (0, balanceTb_1.updateBalance)(client.user.id, user.username, -args.points, pool);
            await (0, balanceTb_1.updateBalance)(user.id, user.username, args.points, pool);
            const points = await (0, getPoints_1.getCurrentBalance)(user.id, pool);
            await (0, set_roles_1.setRoles)(user.id, message.guild, points, pool, this.client);
        }));
        //}
        // const points = await getCurrentBalance(BOT.id, pool)
        // await setRoles(BOT.id, message.guild, points,pool,this.client,)
        await message.react("✅");
        if (targets.size === 1) {
            // Get points first if there's only one user granted
            // This is to display how many points they now have (in slack)
            const user = targets.first();
            const points = await (0, getPoints_1.getCurrentBalance)(user.id, pool);
            const emoji = await (0, emoji_tb_1.getEmoji)(pool);
            await (0, logging_1.logGrantMain)(message, args.points, this.client, emoji, pool, points);
        }
        else {
            const emoji = await (0, emoji_tb_1.getEmoji)(pool);
            // Log normally otherwise
            await (0, logging_1.logGrantMain)(message, args.points, this.client, emoji, pool);
        }
    }
}
exports.default = GrantCommand;
