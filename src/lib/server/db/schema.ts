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

export const billingCustomer = sqliteTable('billing_customer', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	workspaceId: text('workspace_id')
		.notNull()
		.unique()
		.references(() => workspace.id, { onDelete: 'cascade' }),
	stripeCustomerId: text('stripe_customer_id').notNull().unique(),
	...timestamps
});

export const subscription = sqliteTable('subscription', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	workspaceId: text('workspace_id')
		.notNull()
		.unique()
		.references(() => workspace.id, { onDelete: 'cascade' }),
	stripeCustomerId: text('stripe_customer_id').notNull(),
	stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
	plan: text('plan', { enum: ['free', 'pro', 'team'] })
		.notNull()
		.default('free'),
	status: text('status', {
		enum: [
			'trialing',
			'active',
			'past_due',
			'canceled',
			'incomplete',
			'incomplete_expired',
			'unpaid',
			'paused',
			'none'
		]
	})
		.notNull()
		.default('none'),
	priceLookupKey: text('price_lookup_key'),
	currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
	cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).notNull().default(false),
	...timestamps
});

export * from './auth.schema';
