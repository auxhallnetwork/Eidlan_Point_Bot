import {
  DMChannel,
  Guild,
  GuildChannel,
  NewsChannel,
  TextChannel,
  
} from "discord.js"
import {
  POINTS_CHECKING_CHANNELS,
  NORMAL_LOG_CHANNEL,
  MAIN_GRANTS_LOG_CHANNEL,
  MAIN_LOCAL_LOG_CHANNEL,
  PRIVATE_GRANT_POINT_CHANNEL,
} from "../constants"

// See constants.ts for channel descriptions
type ChannelType =
  | "checking"
  | "log-normal"
  | "log-main-grants"
  | "log-main-local"
  | "unknown"
  | "private-grant"

export function getChannelByType(guild: Guild, type: ChannelType) {
  return guild.channels.cache.find(
    (channel) => getChannelType(channel) === type
  ) as TextChannel
}

export function getChannelType(
  channel: TextChannel | DMChannel | NewsChannel | GuildChannel
): ChannelType {
  const isTextChannel = channel.type === "text"

  if (
    channel.type === "dm" ||
    (isTextChannel &&
      POINTS_CHECKING_CHANNELS.some((checkingChannel) =>
        channel.name.includes(checkingChannel)
      ))
  ) {
    return "checking"
  }

  const isNormalLogChannel =
    isTextChannel && channel.name.includes(NORMAL_LOG_CHANNEL)

  const isMainLocalLogChannel =
    isTextChannel && channel.name.includes(MAIN_LOCAL_LOG_CHANNEL)

  const isMainGrantsLogChannel =
    isTextChannel && channel.name.includes(MAIN_GRANTS_LOG_CHANNEL)
  
  const isPrivateGrant = isTextChannel &&  channel.name.includes(PRIVATE_GRANT_POINT_CHANNEL)

  if (isNormalLogChannel && !isMainGrantsLogChannel && !isMainLocalLogChannel && !isPrivateGrant) {
    return "log-normal"
  }

  if (isMainLocalLogChannel) {
    return "log-main-local"
  }

  if (isMainGrantsLogChannel) {
    return "log-main-grants"
  }

  if(isPrivateGrant)
    return "private-grant"

  return "unknown"
}
