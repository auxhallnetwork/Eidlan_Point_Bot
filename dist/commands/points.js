"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const format_number_1 = require("../functions/format_number");
const channels_1 = require("../functions/channels");
const getPoints_1 = require("../functions/getPoints");
const emoji_tb_1 = require("../database/emoji_tb");
class PointsCommand extends discord_akairo_1.Command {
    constructor() {
        super("points", {
            aliases: ["points", "score", "balance", "point"],
            category: "main",
            cooldown: 3000,
            ratelimit: 2,
            args: [
                {
                    id: "user",
                    type: "user",
                    default: (message) => message.author,
                },
            ],
        });
    }
    async exec(message, args) {
        const checkingChannel = (0, channels_1.getChannelByType)(message.guild, "checking");
        try {
            if (!checkingChannel || (0, channels_1.getChannelType)(message.channel) !== "checking") {
                const errorMessage = !checkingChannel
                    ? `Your \`!points\` post was removed from <#${message.channel.id}>. Please ask your server admins to create a channel called \`#check-your-points\`. That is the only channel where you will be able to check your points via \`!points\`. Thank you.`
                    : `Your \`!points\` post was removed from <#${message.channel.id}>. Please only post \`!points\` in ${checkingChannel}. Thank you.`;
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
        const pool = message.client.pool;
        if (args.user.id === this.client.user.id) {
            await message.reply("Invalid Command");
            return "INVALID_ARGUMENTS";
        }
        const points = await (0, getPoints_1.getCurrentBalance)(args.user.id, pool);
        await message.reply(`by my calculation, ${args.user} currently has ${await (0, emoji_tb_1.getEmoji)(pool)} ${(0, format_number_1.formatNumber)(points)}.`);
    }
}
exports.default = PointsCommand;
