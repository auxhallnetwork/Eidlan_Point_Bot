import { Pool } from "mysql2/promise"

export async  function updateBalance(userID: string,username: string, point: number, pool: Pool) {
  
  
  var current_point_balance = await getDbCurrentBalance(userID,pool)
  if(current_point_balance[0]===undefined){
    pool.execute(
      "INSERT INTO balance (UserId, current_points,username) VALUES(?, ?, ?)",
      [userID,point,username]
    )
  }
   else{
      point += Number(current_point_balance[0].cp)
   }

  
   
    
   
  
  return pool.execute(
    "UPDATE  balance SET current_points=? WHERE UserId = ?",
    [point,userID]
  )
  }

  export async function getDbCurrentBalance(userID: string, pool: Pool) {
    const [rows] = await pool.execute(
      ` SELECT current_points as cp FROM balance WHERE UserId = ?`,
      [userID]
    )
    
   return rows;
  }