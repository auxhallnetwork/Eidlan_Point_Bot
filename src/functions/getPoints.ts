import { getDbCurrentBalance } from "../database/balanceTb";
import { Pool } from "mysql2/promise"

export async function getCurrentBalance(userID: string, pool: Pool) {

    var point = await getDbCurrentBalance(userID,pool)
    if(point[0]===undefined){
        return 0;
    }
    else
        return Number(point[0].cp)

}