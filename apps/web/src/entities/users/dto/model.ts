import { users } from "@vidzy/database"
import { InferInsertModel } from "drizzle-orm"

export type UserModelType = InferInsertModel<typeof users>
