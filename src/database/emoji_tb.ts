import { Pool } from "mysql2/promise"

export async function getEmoji( pool: Pool) {
    const [rows] = await pool.execute(
      ` SELECT Symbol as emoji FROM Emoji `,
      
    )
   if(rows[0]===undefined){
      return "<:EidlandCoins:951246267105820752>"
   }
    
   return rows[0].emoji.toString();
  }