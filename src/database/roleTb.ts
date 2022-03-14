import { Pool } from "mysql2/promise"

export async function getRoles(point: Number, pool: Pool) {
    const [rows] = await pool.execute(
      ` SELECT RoleId as id , Min as min, EMoji as emoji FROM role  ORDER BY Min DESC`,
      
    )

    
    
    return rows;
}