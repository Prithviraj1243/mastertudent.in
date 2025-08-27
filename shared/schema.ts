import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const roleEnum = pgEnum('role', ['student', 'topper', 'reviewer', 'admin']);
export const noteStatusEnum = pgEnum('note_status', ['draft', 'submitted', 'approved', 'published', 'rejected', 'archived']);
export const reviewStatusEnum = pgEnum('review_status', ['open', 'changes_requested', 'approved', 'rejected']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'cancelled', 'past_due']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'approved', 'paid']);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: roleEnum("role").default('student').notNull(),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true).notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Topper profiles
export const topperProfiles = pgTable("topper_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bio: text("bio"),
  subjects: text("subjects").array(),
  achievements: text("achievements"),
  ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 }).default('0'),
  followersCount: integer("followers_count").default(0),
  totalDownloads: integer("total_downloads").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notes
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  subject: varchar("subject").notNull(),
  topic: varchar("topic"),
  classGrade: varchar("class_grade").notNull(),
  description: text("description"),
  attachments: text("attachments").array(),
  status: noteStatusEnum("status").default('draft').notNull(),
  version: integer("version").default(1),
  slug: varchar("slug").unique(),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  featured: boolean("featured").default(false),
  downloadsCount: integer("downloads_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review tasks
export const reviewTasks = pgTable("review_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  status: reviewStatusEnum("status").default('open').notNull(),
  comments: text("comments").array(),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  plan: varchar("plan").notNull(), // 'monthly' or 'yearly'
  startDate: timestamp("start_date").notNull(),
  renewalDate: timestamp("renewal_date").notNull(),
  status: subscriptionStatusEnum("status").default('active').notNull(),
  gateway: varchar("gateway").default('stripe'),
  gatewayCustomerId: varchar("gateway_customer_id"),
  gatewaySubId: varchar("gateway_sub_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // 'charge', 'refund', 'payout'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default('INR'),
  gateway: varchar("gateway"),
  gatewayRef: varchar("gateway_ref"),
  status: varchar("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payouts
export const payouts = pgTable("payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  grossPoolShare: decimal("gross_pool_share", { precision: 10, scale: 2 }).notNull(),
  adjustments: decimal("adjustments", { precision: 10, scale: 2 }).default('0'),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  status: payoutStatusEnum("status").default('pending').notNull(),
  paidAt: timestamp("paid_at"),
  method: varchar("method").default('manual'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follows (students following toppers)
export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Downloads (track what students downloaded)
export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  body: text("body"),
  read: boolean("read").default(false),
  link: varchar("link"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  topperProfile: one(topperProfiles, {
    fields: [users.id],
    references: [topperProfiles.userId],
  }),
  notesAsTopper: many(notes, { relationName: "topperNotes" }),
  notesAsReviewer: many(notes, { relationName: "reviewerNotes" }),
  reviewTasks: many(reviewTasks),
  feedback: many(feedback),
  subscriptions: many(subscriptions),
  transactions: many(transactions),
  payoutsAsTopper: many(payouts),
  followsAsStudent: many(follows, { relationName: "studentFollows" }),
  followsAsTopper: many(follows, { relationName: "topperFollows" }),
  downloads: many(downloads),
  notifications: many(notifications),
}));

export const topperProfilesRelations = relations(topperProfiles, ({ one }) => ({
  user: one(users, {
    fields: [topperProfiles.userId],
    references: [users.id],
  }),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  topper: one(users, {
    fields: [notes.topperId],
    references: [users.id],
    relationName: "topperNotes",
  }),
  reviewer: one(users, {
    fields: [notes.reviewerId],
    references: [users.id],
    relationName: "reviewerNotes",
  }),
  reviewTasks: many(reviewTasks),
  feedback: many(feedback),
  downloads: many(downloads),
}));

export const reviewTasksRelations = relations(reviewTasks, ({ one }) => ({
  note: one(notes, {
    fields: [reviewTasks.noteId],
    references: [notes.id],
  }),
  reviewer: one(users, {
    fields: [reviewTasks.reviewerId],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  note: one(notes, {
    fields: [feedback.noteId],
    references: [notes.id],
  }),
  student: one(users, {
    fields: [feedback.studentId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  student: one(users, {
    fields: [subscriptions.studentId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  topper: one(users, {
    fields: [payouts.topperId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  student: one(users, {
    fields: [follows.studentId],
    references: [users.id],
    relationName: "studentFollows",
  }),
  topper: one(users, {
    fields: [follows.topperId],
    references: [users.id],
    relationName: "topperFollows",
  }),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  student: one(users, {
    fields: [downloads.studentId],
    references: [users.id],
  }),
  note: one(notes, {
    fields: [downloads.noteId],
    references: [notes.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTopperProfileSchema = createInsertSchema(topperProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewTaskSchema = createInsertSchema(reviewTasks).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type TopperProfile = typeof topperProfiles.$inferSelect;
export type InsertTopperProfile = z.infer<typeof insertTopperProfileSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type ReviewTask = typeof reviewTasks.$inferSelect;
export type InsertReviewTask = z.infer<typeof insertReviewTaskSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Download = typeof downloads.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
