"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const points_1 = require("../database/points");
const format_number_1 = require("../functions/format_number");
const set_roles_1 = require("../functions/set_roles");
const logging_1 = require("../functions/logging");
const get_targets_1 = require("../functions/get_targets");
const balanceTb_1 = require("../database/balanceTb");
const getPoints_1 = require("../functions/getPoints");
const channels_1 = require("../functions/channels");
const emoji_tb_1 = require("../database/emoji_tb");
class SendCommand extends discord_akairo_1.Command {
    constructor() {
        super("send", {
            aliases: ["send", "give", "trade", "transfer", "pay"],
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
            lock: "user",
        });
    }
    async exec(message, args) {
        const targets = (0, get_targets_1.getUsersBeforePoints)(message);
        const client = this.client;
        // Need at least one user and some points
        const checkingChannel = (0, channels_1.getChannelByType)(message.guild, "private-grant");
        try {
            if ((0, channels_1.getChannelType)(message.channel) == "private-grant") {
                const errorMessage = `Your \`!send\` post was removed from <#${message.channel.id}>. Please only post \`!send\` in any public channel. Thank you.`;
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
        if (targets.size === 0 || args.points <= 0) {
            await message.reply("incorrect number of arguments: !send @user [number of Points] " + message.author.id);
            return "INVALID_ARGUMENTS";
        }
        // Users can't send points to themselves
        const callerInTargets = targets.has(message.author.id);
        if (callerInTargets) {
            await message.reply("you cannot send Points to yourself.");
            return "INVALID_ARGUMENTS";
        }
        // Users can't send points to the bot
        const botInTargets = targets.has(client.user.id);
        if (botInTargets) {
            await message.reply("you cannot send Points to me.");
            return "INVALID_ARGUMENTS";
        }
        const pool = client.pool;
        // Check if caller has enough points to send
        const callerPoints = await (0, getPoints_1.getCurrentBalance)(message.author.id, pool);
        if (callerPoints < args.points * targets.size) {
            await message.reply(`you only have ${await (0, emoji_tb_1.getEmoji)(pool)} ${(0, format_number_1.formatNumber)(callerPoints)}.`);
            return "NOT_ENOUGH_POINTS";
        }
        // Save each send in database
        await Promise.all(targets.map(async (user) => {
            await (0, points_1.sendPoints)(message.author, user, args.points, pool);
            await (0, balanceTb_1.updateBalance)(message.author.id, -args.points, pool);
            await (0, balanceTb_1.updateBalance)(user.id, args.points, pool);
            // Set role of each user
            const points = await (0, getPoints_1.getCurrentBalance)(user.id, pool);
            await (0, set_roles_1.setRoles)(user.id, message.guild, points, pool, this.client);
        }));
        //const balance = await updateBalance(message.author.id,args.points,pool)
        //await message.author.send("Ki khobor chotto bondhu")
        await message.react("✅");
        // Set role of sender
        const points = await (0, getPoints_1.getCurrentBalance)(message.author.id, pool);
        await (0, set_roles_1.setRoles)(message.author.id, message.guild, points, pool, this.client);
        // Log the transfer
        const emoji = await (0, emoji_tb_1.getEmoji)(pool);
        await (0, logging_1.logTransfer)(message, args.points, this.client, emoji);
    }
}
exports.default = SendCommand;
