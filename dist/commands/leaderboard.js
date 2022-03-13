"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const format_number_1 = require("../functions/format_number");
const points_1 = require("../database/points");
const channels_1 = require("../functions/channels");
class LeaderboardCommand extends discord_akairo_1.Command {
    constructor() {
        super("leaderboard", {
            aliases: ["leaderboard", "scoreboard", "leaders"],
            category: "main",
            cooldown: 3000,
            ratelimit: 2,
            args: [
                {
                    id: "limit",
                    type: "number",
                    default: 10,
                },
            ],
        });
    }
    async exec(message, args) {
        const checkingChannel = (0, channels_1.getChannelByType)(message.guild, "checking");
        try {
            if (!checkingChannel || (0, channels_1.getChannelType)(message.channel) !== "checking") {
                const errorMessage = !checkingChannel
                    ? `Your \`!leaderboard\` post was removed from <#${message.channel.id}>. Please ask your server admins to create a channel called \`#check-your-points\`. That is the only channel where you will be able to view the leaderboard via \`!leaderboard\`. Thank you.`
                    : `Your \`!leaderboard\` post was removed from <#${message.channel.id}>. Please only post \`!leaderboard\` in ${checkingChannel}. Thank you.`;
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
        let limit = args.limit;
        if (args.limit === 0) {
            limit = 10;
        }
        else if (args.limit > 24) {
            limit = 25;
        }
        const rows = await (0, points_1.getLeaderboard)(limit, message.client.pool);
        let list = "";
        for (let i = 0; i < rows.length; i++) {
            list +=
                // Add spaces to single digit rows (1-9)
                // to make them line up with double digit rows (10+)
                (i > 8 ? "\n" : "\n ") +
                    (i + 1) +
                    ". <@" +
                    rows[i].userID +
                    ">  " +
                    (0, format_number_1.formatNumber)(rows[i].points);
        }
        await message.reply(`top ${limit} Points holders: ${list}`);
    }
}
exports.default = LeaderboardCommand;
