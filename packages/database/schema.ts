
import { serial, text, pgTable, json, uuid, boolean, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const fileTypeEnum = pgEnum('file_type', ['music', 'video', 'srt', 'image']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  image: varchar('image', { length: 255 })
});

export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id), // Внешний ключ на пользователя
  fileType: fileTypeEnum('file_type').notNull(),
  fileUrl: text('file_url').notNull(), // Ссылка на файл
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(), // Время добавления файла
  fileName: varchar('file_name', { length: 1024 }).notNull(),
  public: boolean('public').default(true).notNull(),
});

export const databaseSchema = {
  users,
  attachments,
};