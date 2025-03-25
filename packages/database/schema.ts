
import { serial, jsonb, primaryKey, text, pgTable, json, uuid, boolean, integer, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const fileTypeEnum = pgEnum('file_type', ['music', 'video', 'srt', 'image', 'other', 'script']);
export const scriptTypeEnum = pgEnum('script_type', ['text', 'json']);


export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  image: varchar('image', { length: 255 })
});

export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id), // Внешний ключ на пользователя
  fileType: fileTypeEnum('file_type').notNull(),
  fileUrl: text('file_url'), // Ссылка на файл
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(), // Время добавления файла
  fileName: varchar('file_name', { length: 1024 }).notNull(),
  public: boolean('public').default(true).notNull(),
  script: text('script'),
  scriptType: scriptTypeEnum('script_type').default('text')
});


// Основная таблица для хранения workflows
export const renderWorkflows = pgTable('render_workflows', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull().unique(), // Уникальное название
  flowData: jsonb('flow_data').notNull(), // JSON-данные из react-flow
  authorId: uuid('author_id').notNull().references(() => users.id), // Кто создал
  public: boolean('public').default(false).notNull(), // Публичный или приватный
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Таблица для хранения invite-ссылок
export const workflowInviteLinks = pgTable('workflow_invite_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflowId: uuid('workflow_id').notNull().references(() => renderWorkflows.id, { onDelete: 'cascade' }),
  creatorId: uuid('creator_id').notNull().references(() => users.id), // Кто создал ссылку
  token: varchar('token', { length: 64 }).notNull().unique(), // Уникальный токен ссылки
  expiresAt: timestamp('expires_at'), // Срок действия (опционально)
  maxUses: integer('max_uses'), // Максимальное число использований (опционально)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица для хранения доступа пользователей к workflows
export const workflowAccess = pgTable('workflow_access', {
  workflowId: uuid('workflow_id').notNull().references(() => renderWorkflows.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id),
  invitedById: uuid('invited_by_id').references(() => users.id), // Кто пригласил
  inviteLinkId: uuid('invite_link_id').references(() => workflowInviteLinks.id), // Через какую ссылку
  accessedAt: timestamp('accessed_at').defaultNow().notNull(),
}, (table) => ({
  // Составной первичный ключ (чтобы один пользователь не мог быть добавлен дважды к одному workflow)
  pk: primaryKey({ columns: [table.workflowId, table.userId] }),
}));

export const databaseSchema = {
  users,
  attachments,
  renderWorkflows
};