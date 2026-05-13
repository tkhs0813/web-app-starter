import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamps = {
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
};

export const workspace = sqliteTable('workspace', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	ownerId: text('owner_id').notNull(),
	...timestamps
});

export const workspaceMember = sqliteTable(
	'workspace_member',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		workspaceId: text('workspace_id')
			.notNull()
			.references(() => workspace.id, { onDelete: 'cascade' }),
		userId: text('user_id').notNull(),
		role: text('role', { enum: ['owner', 'admin', 'member'] })
			.notNull()
			.default('member'),
		...timestamps
	},
	(table) => [
		uniqueIndex('workspace_member_workspace_user_idx').on(table.workspaceId, table.userId)
	]
);

export const project = sqliteTable('project', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	workspaceId: text('workspace_id')
		.notNull()
		.references(() => workspace.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	status: text('status', { enum: ['backlog', 'active', 'archived'] })
		.notNull()
		.default('backlog'),
	...timestamps
});

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	projectId: text('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1),
	completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
	...timestamps
});

export * from './auth.schema';
