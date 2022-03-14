import { Message } from "discord.js"
import { Command } from "discord-akairo"
import { getPoints, grantPoints } from "../database/points"
import { Accountant } from "../client"
import { setRoles } from "../functions/set_roles"
import { isAdmin } from "../database/admin"
import { sorry } from "../functions/sorry"
import { COMMAND_ERROR } from "../types"
import { logGrantMain } from "../functions/logging"
import { getUsersBeforePoints } from "../functions/get_targets"
import {updateBalance} from "../database/balanceTb"
import { formatNumber } from "../functions/format_number"
import { validateGrantCommand } from "../functions/checkCommandFormats"
import {getCurrentBalance} from "../functions/getPoints"
import { getChannelByType, getChannelType } from "../functions/channels"
import { getEmoji } from "../database/emoji_tb"

export default class GrantCommand extends Command {
  
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
    })
  }

  async exec(
    message: Message,
    args: { points: number }
  ): Promise<COMMAND_ERROR> {
    const pool = (this.client as Accountant).pool
    const client = this.client as Accountant

    // Check if caller is in admin list
    if (!(await isAdmin(message.author.id, pool))) {
      await sorry(message)
      return "NOT_ADMIN"
    }
    let checkAdmin = false;
    

    const checkingChannel = getChannelByType(message.guild, "private-grant")
    try {
      if (!checkingChannel || getChannelType(message.channel) !== "private-grant") {
        const errorMessage = 
          `Your \`!grant\` command was removed from <#${message.channel.id}>. Please only post \`!grant\` in ${checkingChannel}. Thank you.`
          
        await message.author.send(errorMessage)
        if (message.deletable && !message.deleted) {
          await message.delete().catch((err) => console.warn(err))
        }
        return "WRONG_CHANNEL"
      }
    } catch (err) {
      console.warn(err)
    }

    const targets = getUsersBeforePoints(message)

    await Promise.all(
      targets.map(async (user) => {
        
        checkAdmin = checkAdmin || await isAdmin(user.id,pool)
      })
    )

    

    // Need at least one user and some points
    //var c = validateGrantCommand(message,targets.size)
    //console.log(c+" ccccc " + targets.size+" arg "+args.points)
    if (targets.size==0 || args.points <= 0) {
      await message.reply(
        "Incorrect number of arguments: !grant @user [number of Points]."
      )
      return
    }

    const botInTargets = targets.has(client.user.id)
    if (botInTargets) {
      await message.reply("You cannot grant me Points.")
      return "INVALID_ARGUMENTS"
    }

    const callerPoints = await getCurrentBalance(client.user.id, pool)
  
    if (callerPoints < args.points * targets.size) {
      await message.reply(
        //`you only have ${POINTS_EMOTE}${formatNumber(callerPoints)}.`
        `Due to point defficiency, this grant is not possible`
      )
      return "NOT_ENOUGH_POINTS"
    }

    await Promise.all(
      targets.map(async (user) => {
        
        await grantPoints(client.user, user, args.points, pool)
        await updateBalance(client.user.id,user.username,-args.points,pool)
        await updateBalance(user.id,user.username,args.points,pool)
        const points = await getCurrentBalance(user.id, pool)
        await setRoles(user.id, message.guild, points,pool,this.client,)
      })
    )

    //}

    // const points = await getCurrentBalance(BOT.id, pool)
    // await setRoles(BOT.id, message.guild, points,pool,this.client,)

    await message.react("✅")
    
    if (targets.size === 1) {
      // Get points first if there's only one user granted
      // This is to display how many points they now have (in slack)
      const user = targets.first()
      const points = await getCurrentBalance(user.id, pool)
      const emoji = await getEmoji(pool)
      await logGrantMain(message, args.points, this.client,emoji,pool ,points)
    } else {
      const emoji = await getEmoji(pool)
      // Log normally otherwise
      await logGrantMain(message, args.points, this.client,emoji,pool)
    }
  }
}
