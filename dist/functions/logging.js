"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logGrantMain = exports.logTransfer = void 0;
const config_1 = require("../config");
const format_number_1 = require("./format_number");
const main_guild_1 = require("./main_guild");
const channels_1 = require("./channels");
const axios_1 = __importDefault(require("axios"));
const get_targets_1 = require("./get_targets");
function generateLogMessages(message, points, newPoints, isAdmin) {
    const targets = (0, get_targets_1.getUsersBeforePoints)(message);
    const discord = targets
        .map((user) => user.toString())
        .join(", ")
        .replace(/,(?=[^,]*$)/, " and");
    const slack = targets
        .map((user) => `*${user.username}*`)
        .join(", ")
        .replace(/,(?=[^,]*$)/, " and");
    const guild = message.guild;
    const transferMain = `${message.author} sent ${POINTS_EMOTE}${(0, format_number_1.formatNumber)(points)} to ${discord} in **${guild.name}** (Server ID: ${guild.id}).`;
    const transferNonMain = `${message.author} sent ${POINTS_EMOTE} ${(0, format_number_1.formatNumber)(points)} to ${discord}.`;
    // const total_balance = targets
    //   .map(async (user)  => `${await getCurrentBalance(user.id,pool_local)} ${POINTS_EMOTE}`)
    //   .join(", ")
    //   .replace(/,(?=[^,]*$)/, " and")
    // const transferNonMain =  `current balance of ${discord} : ${total_balance} `
    //`${message.author} sent ${POINTS_EMOTE}${formatNumber(  points)} to ${discord}.`
    //const transferMain = `current balance of ${discord} : ${total_balance} `
    //   var grantDiscord_var
    //   if(!isAdmin){
    //     grantDiscord_var = `${message.author} granted ${POINTS_EMOTE}${formatNumber(
    //     points
    //   )} to ${discord} in **${guild.name}** (Server ID: ${
    //     guild.id
    //   }) with message "${message.content}".`
    // }
    // else{
    //   grantDiscord_var = `Admin grant ${POINTS_EMOTE}${formatNumber(
    //     points
    //   )} to ${message.author} in **${guild.name}** (Server ID: ${
    //     guild.id
    //   }) with message "${message.content}".`
    // }
    const grantDiscord = ` An admin granted ${discord}  ${POINTS_EMOTE} ${(0, format_number_1.formatNumber)(points)}  `;
    let grantDiscordLocal_var;
    //if(!isAdmin)
    // grantDiscordLocal_var = `
    // ${message.author} granted ${POINTS_EMOTE}${formatNumber(
    //   points
    // )} to ${discord} with message "${message.content}".`
    // else{
    //   grantDiscordLocal_var = `Admin grant ${POINTS_EMOTE}${formatNumber(
    //     points
    //   )} to ${message.author} with message "${message.content}".`
    // }
    const grantDiscordLocal = `${discord} has been granted ${POINTS_EMOTE} ${(0, format_number_1.formatNumber)(points)} by an admin `;
    let grantSlack = "";
    if (targets.size === 1) {
        const user = targets.first();
        grantSlack = `*${message.author.username}* granted *${user.username}* ${(0, format_number_1.formatNumber)(points)} Points in *${guild.name}* (Server ID: ${guild.id}) with message "${message.content}". *${user.username}* now has ${(0, format_number_1.formatNumber)(newPoints !== null && newPoints !== void 0 ? newPoints : "")} Points.`;
    }
    else {
        grantSlack = `I recorded that ${slack} have been granted ${(0, format_number_1.formatNumber)(points)} Points each in *${guild.name}* (Server ID: ${guild.id}) with message "${message.content}".`;
    }
    return {
        transferMain,
        transferNonMain,
        grantDiscord,
        grantDiscordLocal,
        grantSlack,
    };
}
async function logTransfer(message, points, client, emoji) {
    POINTS_EMOTE = emoji;
    await logTransferMain(message, points, client);
    if (!(0, main_guild_1.isMainGuild)(message.guild, client)) {
        await logTransferNonMain(message, points);
    }
}
exports.logTransfer = logTransfer;
// Log the transfer in the main guild
async function logTransferMain(message, points, client) {
    const mainGuild = (0, main_guild_1.getMainGuild)(client);
    // const mainLogChannel = getChannelByType(mainGuild, "log-normal")
    // if (!mainLogChannel) {
    //   console.warn("Could not find the log channel in the main guild")
    //   return
    // }
    const { transferMain, transferNonMain } = generateLogMessages(message, points);
    try {
        //await mainLogChannel.send(transferMain)
        // If the transfer was in the main guild,
        // log it in the main-local log channel as well without guild info
        if (message.guild === mainGuild) {
            const mainLocalLogChannel = (0, channels_1.getChannelByType)(mainGuild, "log-main-local");
            if (mainLocalLogChannel) {
                await mainLocalLogChannel.send(transferNonMain);
            }
        }
    }
    catch (err) {
        console.warn(err);
    }
}
// Log the transfer without guild info in non-main guilds
async function logTransferNonMain(message, points) {
    // const logChannel = getChannelByType(message.guild, "log-normal")
    // if (!logChannel) {
    //   await message.reply(
    //     "I could not find the log channel. Please create a channel with the name `points-log`."
    //   )
    //   return
    // }
    const { transferNonMain } = generateLogMessages(message, points);
    try {
        //await logChannel.send(transferNonMain)
    }
    catch (err) {
        console.warn(err);
    }
}
// Log the grant in the main guild
let pool_local;
let POINTS_EMOTE;
async function logGrantMain(message, points, client, emoji, pool, newPoints, isAdmin = false) {
    const mainGuild = (0, main_guild_1.getMainGuild)(client);
    pool_local = pool;
    POINTS_EMOTE = emoji;
    //const normalLogChannel = getChannelByType(mainGuild, "log-normal")
    // if (!normalLogChannel) {
    //   console.warn("Could not find the log channel in the main guild")
    //   return
    // }
    const { grantDiscord, grantDiscordLocal, grantSlack, transferMain } = generateLogMessages(message, points, newPoints, isAdmin);
    try {
        //await normalLogChannel.send(await (await setPointLog(message)).toString())
        // Log in the grants log channel as well if it exists
        const mainGrantsLogChannel = (0, channels_1.getChannelByType)(mainGuild, "log-main-grants");
        if (mainGrantsLogChannel) {
            await mainGrantsLogChannel.send(grantDiscord);
        }
        // If the transfer was in the main guild,
        // log it in the main-local log channel as well without guild info
        // if (message.guild === mainGuild) {
        //   const mainLocalLogChannel = getChannelByType(mainGuild, "log-main-local")
        //   if (mainLocalLogChannel) {
        //     await mainLocalLogChannel.send(grantDiscordLocal)
        //   }
        // }
    }
    catch (err) {
        console.warn(err);
    }
    // Send to Slack
    if (config_1.SLACK_WEBHOOK) {
        await axios_1.default.post(config_1.SLACK_WEBHOOK, { text: grantSlack });
    }
}
exports.logGrantMain = logGrantMain;
