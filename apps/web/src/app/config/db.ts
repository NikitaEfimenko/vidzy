import "@/app/config/env-config";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@vidzy/database"
import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL || '';
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
