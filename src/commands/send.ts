import { Message } from "discord.js"
import { Command } from "discord-akairo"
import { getPoints, sendPoints } from "../database/points"
import { Accountant } from "../client"
import { formatNumber } from "../functions/format_number"
import { setRoles } from "../functions/set_roles"
import { POINTS_EMOTE } from "../config"
import { COMMAND_ERROR } from "../types"
import { logTransfer } from "../functions/logging"
import { getUsersBeforePoints } from "../functions/get_targets"
import { updateBalance} from "../database/balanceTb"
import {getCurrentBalance} from "../functions/getPoints"
import { getChannelByType, getChannelType } from "../functions/channels"
import { getEmoji } from "../database/emoji_tb"

export default class SendCommand extends Command {
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
    })
  }

  async exec(
    message: Message,
    args: { points: number }
  ): Promise<COMMAND_ERROR> {
    const targets = getUsersBeforePoints(message)
    const client = this.client as Accountant

    // Need at least one user and some points

    const checkingChannel = getChannelByType(message.guild, "private-grant")
    console.log("kahini"+ getChannelType(message.channel))
    try {
      if ( getChannelType(message.channel) === "private-grant") {
        const errorMessage = 
          `Your \`!send\` post was removed from <#${message.channel.id}>. Please only post \`!send\` in any public channel. Thank you.`
          
        await message.author.send(errorMessage)
        if (message.deletable && !message.deleted) {
          await message.delete().catch((err) => console.warn(err))
        }
        return "WRONG_CHANNEL"
      }
    } catch (err) {
      console.warn(err)
    }

    if (targets.size === 0 || args.points <= 0) {
      await message.reply(
        "incorrect number of arguments: !send @user [number of Points] "+message.author.id
      )
      return "INVALID_ARGUMENTS"
    }

    // Users can't send points to themselves
    const callerInTargets = targets.has(message.author.id)
    if (callerInTargets) {
      await message.reply("you cannot send Points to yourself.")
      return "INVALID_ARGUMENTS"
    }

    // Users can't send points to the bot
    const botInTargets = targets.has(client.user.id)
    if (botInTargets) {
      await message.reply("you cannot send Points to me.")
      return "INVALID_ARGUMENTS"
    }

    const pool = client.pool

    // Check if caller has enough points to send
    const callerPoints = await getCurrentBalance(message.author.id, pool)
    if (callerPoints < args.points * targets.size) {
      await message.reply(
        `you only have ${await getEmoji(pool)} ${formatNumber(callerPoints)}.`
      )
      return "NOT_ENOUGH_POINTS"
    }

    // Save each send in database
    await Promise.all(
      targets.map(async (user) => {
        await sendPoints(message.author, user, args.points, pool)
        await updateBalance(message.author.id,message.author.username,-args.points,pool)
        await updateBalance(user.id,user.username,args.points,pool)
        // Set role of each user
        const points = await getCurrentBalance(user.id, pool)
        await setRoles(user.id, message.guild, points,pool,this.client)
      })
    )
    //const balance = await updateBalance(message.author.id,args.points,pool)
    //await message.author.send("Ki khobor chotto bondhu")
    await message.react("✅")

    // Set role of sender
    const points = await getCurrentBalance(message.author.id, pool)
    await setRoles(message.author.id, message.guild, points,pool,this.client)
    
    // Log the transfer
    const emoji = await getEmoji(pool)
    await logTransfer(message, args.points, this.client,emoji)
  }
}
