import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from 'src/database/database.module';
import { DrizzleDB } from 'src/database/types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { users } from '@vidzy/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB
  ) {}
  async create(createUserDto: CreateUserDto) {
    const newUser = await this.db.insert(users).values({
      username: createUserDto.username
    }).returning();

    return newUser[0];
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    const result = await this.db.select().from(users).where(eq(users.id, id)).execute();
    return result[0];
  }

  async findByUsername(username: string) {
    const result = await this.db.select().from(users).where(eq(users.username, username)).execute();
    return result[0];
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.db
      .update(users).set({
        image: updateUserDto.image,
      })
      .where(eq(users.id, id))
      .execute();
  }

  async remove(id: string) {
    await this.db
    .delete(users)
    .where(eq(users.id, id))
    .execute();
  }
}





export { UpdateUserDto };
