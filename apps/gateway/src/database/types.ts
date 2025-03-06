import { NodePgDatabase } from "drizzle-orm/node-postgres"
import * as schema from "@vidzy/database"


export type DrizzleDB = NodePgDatabase<typeof schema.databaseSchema>;