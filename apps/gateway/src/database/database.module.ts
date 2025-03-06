import { Module, Global } from '@nestjs/common';
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as schema from "@vidzy/database"
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

export const DRIZZLE = Symbol('drizzle_connection')

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbURL = configService.get<string>('DATABASE_URL')
        const pool = new Pool({
          connectionString: dbURL,
          //ssl: true
          ssl: false
        })
        return drizzle(pool, {schema}) as NodePgDatabase<typeof schema>
      }
    }
  ],
  exports: [DRIZZLE]
})
export class DrizzleModule {}
