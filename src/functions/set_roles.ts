import { Console } from "console"
import { Guild, TextChannel } from "discord.js"
import { Pool } from "mysql2/promise"
import { ROLE_LEVELS } from "../config"
import { getRoles } from "../database/roleTb";
import { getChannelByType } from "./channels"
import { getMainGuild, isMainGuild } from "./main_guild"
import { Accountant } from "../client"
import { AkairoClient } from "discord-akairo"
import { ACHIEVEMENT_LOG } from "../constants";

// Set a user's roles according to the amount of points they have
export async function setRoles(userID: string, guild: Guild, points: number,pool:Pool,client: AkairoClient) {
  // Disable if not configured
  var reply;
 
  var role_level = await getRoles(points,pool)
  if (role_level[0]===undefined) {
    
    return
  }

  try {
    // Ignore DMs, guild data aren't available
    
    if (!guild) {
      
      return

    }

    const guildMember = guild.members.cache.get(userID)
   
    if (!guildMember) {
     
      return
    }

    let roleId = ""
    // Sort roles in descending order
    
    //const roleLevels = ROLE_LEVELS.sort((a, b) => b.min - a.min)
   
    // Add a new role that matches the amount of points
    for (let i = 0; role_level[i]!=undefined; i++) {
      if (points >= role_level[i].min) {
        roleId = role_level[i].id
        if (!guildMember.roles.cache.find(ch=> ch.name === roleId)) {
          const role = guild.roles.cache.find(ch=> ch.name === roleId)
          if (role) {
            guildMember.roles.add(role).catch(console.warn)
            const roleLogeChannel = guild.channels.cache.find(ch=> ch.name===ACHIEVEMENT_LOG)
            if(roleLogeChannel.isText()){
              if(role_level[i].emoji!=undefined)
                (<TextChannel> roleLogeChannel).send(`${guildMember} has earned a ${role} ${role_level[i].emoji}`)
              else
                (<TextChannel> roleLogeChannel).send(`${guildMember} has earned a ${role} `)
            }
            
          }
          reply = true;
        }
        
        break
      }
    }

    //Remove the old role if we added a new one
    for (let i = 0; role_level[i]!=undefined; i++) {
      if (roleId !== role_level[i].id) {
        if (guildMember.roles.cache.has(role_level[i].id)) {
          const role = guild.roles.cache.get(role_level[i].id)
          if (role) guildMember.roles.remove(role).catch(console.warn)
        }
      }
    }
  } catch (err) {
    console.warn(err)
  }
}
