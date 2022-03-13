import { Collection, Message, User } from "discord.js"

export function validateGrantCommand(
    message: Message,
    size: Number
  ) {
    const match = message.content.match(/@/)
    var checkSize = size== 0
    return ! match!= checkSize
   
  }