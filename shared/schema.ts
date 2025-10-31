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
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'approved', 'rejected', 'settled']);
export const noteTypeEnum = pgEnum('note_type', ['notes', 'homework']);
export const transactionTypeEnum = pgEnum('transaction_type', ['coin_earned', 'coin_spent', 'coin_purchased', 'download_free', 'download_paid', 'upload_reward']);
export const forumCategoryEnum = pgEnum('forum_category', ['latest_news', 'revolutionary_ideas', 'assignment_discussions', 'general', 'help_support']);
export const broadcastTargetEnum = pgEnum('broadcast_target', ['all_users', 'students', 'toppers', 'reviewers']);

// Educational Category Enums
export const categoryTypeEnum = pgEnum('category_type', ['school', 'competitive_exam', 'professional_exam', 'college', 'certification']);
export const classLevelEnum = pgEnum('class_level', ['6', '7', '8', '9', '10', '11', '12']);
export const boardEnum = pgEnum('board', ['CBSE', 'ICSE', 'State_Board', 'IB', 'IGCSE']);
export const subjectEnum = pgEnum('subject', [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer_Science',
  'Economics', 'Accountancy', 'Business_Studies', 'Political_Science', 'History', 'Geography',
  'Sociology', 'Psychology', 'Philosophy', 'Physical_Education', 'Fine_Arts', 'Music',
  'Sanskrit', 'French', 'German', 'Spanish', 'Japanese', 'Statistics', 'Home_Science',
  'Biotechnology', 'Engineering_Graphics', 'Agriculture', 'Environmental_Science'
]);
export const examTypeEnum = pgEnum('exam_type', [
  'JEE_Main', 'JEE_Advanced', 'NEET_UG', 'NEET_PG', 'CUET_UG', 'CUET_PG', 'GATE',
  'CAT', 'MAT', 'XAT', 'SNAP', 'NMAT', 'CMAT', 'UPSC_CSE', 'UPSC_IES', 'UPSC_CDS',
  'SSC_CGL', 'SSC_CHSL', 'SSC_CPO', 'SSC_MTS', 'RRB_NTPC', 'RRB_Group_D', 'SBI_PO',
  'IBPS_PO', 'IBPS_Clerk', 'RBI_Grade_B', 'NABARD', 'LIC_AAO', 'NICL_AO',
  'State_PSC', 'Teacher_Eligibility', 'NDA', 'CDS', 'AFCAT', 'CAPF',
  'UGC_NET', 'CSIR_NET', 'ICAR_NET', 'ICAI_CA', 'ICWA_CMA', 'CS_Foundation',
  'CLAT', 'AILET', 'LSAT', 'Medical_Entrance', 'Engineering_Entrance'
]);
export const engineeringBranchEnum = pgEnum('engineering_branch', [
  'Computer_Science', 'Information_Technology', 'Electronics_Communication', 'Electrical',
  'Mechanical', 'Civil', 'Chemical', 'Aerospace', 'Biotechnology', 'Automobile',
  'Industrial', 'Mining', 'Metallurgical', 'Textile', 'Food_Technology',
  'Environmental', 'Marine', 'Petroleum', 'Agricultural', 'Biomedical',
  'Robotics', 'AI_ML', 'Data_Science', 'Cyber_Security'
]);
export const medicalBranchEnum = pgEnum('medical_branch', [
  'MBBS_General', 'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology',
  'Microbiology', 'Forensic_Medicine', 'Community_Medicine', 'Internal_Medicine',
  'Surgery', 'Obstetrics_Gynecology', 'Pediatrics', 'Orthopedics', 'Ophthalmology',
  'ENT', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology',
  'Emergency_Medicine', 'Cardiology', 'Neurology', 'Gastroenterology', 'Pulmonology',
  'Nephrology', 'Endocrinology', 'Oncology', 'Urology', 'Plastic_Surgery',
  'Neurosurgery', 'Cardiac_Surgery', 'Dental', 'Nursing', 'Pharmacy', 
  'Physiotherapy', 'Occupational_Therapy', 'Medical_Lab_Technology', 'Radiology_Technology'
]);

// Educational Categories Master Table
export const educationalCategories = pgTable("educational_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  categoryType: categoryTypeEnum("category_type").notNull(),
  classLevel: classLevelEnum("class_level"),
  board: boardEnum("board"),
  examType: examTypeEnum("exam_type"),
  engineeringBranch: engineeringBranchEnum("engineering_branch"),
  medicalBranch: medicalBranchEnum("medical_branch"),
  subjects: subjectEnum("subjects").array(),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").default(0),
  icon: varchar("icon"),
  color: varchar("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Educational Preferences
export const userEducationalPreferences = pgTable("user_educational_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: varchar("category_id").references(() => educationalCategories.id).notNull(),
  isPrimary: boolean("is_primary").default(false), // Primary category for user
  createdAt: timestamp("created_at").defaultNow(),
});

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
  coinBalance: integer("coin_balance").default(100).notNull(), // Starting bonus
  freeDownloadsLeft: integer("free_downloads_left").default(3).notNull(), // Free downloads per day
  lastFreeDownloadReset: timestamp("last_free_download_reset").defaultNow(),
  reputation: integer("reputation").default(0).notNull(),
  streak: integer("streak").default(0).notNull(), // Login streak
  totalEarned: integer("total_earned").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(),
  // Educational preferences
  onboardingCompleted: boolean("onboarding_completed").default(false),
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
  subject: subjectEnum("subject").notNull(),
  topic: varchar("topic"),
  description: text("description"),
  attachments: text("attachments").array(),
  status: noteStatusEnum("status").default('draft').notNull(),
  type: noteTypeEnum("type").default('notes').notNull(),
  version: integer("version").default(1),
  slug: varchar("slug").unique(),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  featured: boolean("featured").default(false),
  downloadsCount: integer("downloads_count").default(0),
  viewsCount: integer("views_count").default(0),
  likesCount: integer("likes_count").default(0),
  price: integer("price").default(5).notNull(), // Coins required to download
  isPremium: boolean("is_premium").default(false),
  tags: text("tags").array(),
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  estimatedTime: integer("estimated_time"), // minutes to complete
  thumbnailUrl: varchar("thumbnail_url"),
  // Educational categorization
  categoryId: varchar("category_id").references(() => educationalCategories.id).notNull(),
  classGrade: varchar("class_grade"), // For backwards compatibility, will be deprecated
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
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // Coins amount
  coinChange: integer("coin_change").notNull(), // +/- coins
  noteId: varchar("note_id").references(() => notes.id), // For download transactions
  description: text("description"),
  metadata: jsonb("metadata"), // Additional data
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

// Views tracking (for coin earning)
export const noteViews = pgTable("note_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  viewerId: varchar("viewer_id").references(() => users.id).notNull(),
  coinsEarned: integer("coins_earned").default(0),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Likes
export const noteLikes = pgTable("note_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum categories
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  category: forumCategoryEnum("category").notNull(),
  postsCount: integer("posts_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum posts
export const forumPosts = pgTable("forum_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  categoryId: varchar("category_id").references(() => forumCategories.id).notNull(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewsCount: integer("views_count").default(0),
  repliesCount: integer("replies_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyById: varchar("last_reply_by_id").references(() => users.id),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum replies
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => forumPosts.id).notNull(),
  parentReplyId: varchar("parent_reply_id"),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum reply likes
export const forumReplyLikes = pgTable("forum_reply_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  replyId: varchar("reply_id").references(() => forumReplies.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Coin packages for purchase
export const coinPackages = pgTable("coin_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  coins: integer("coins").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default('INR'),
  isActive: boolean("is_active").default(true),
  bonus: integer("bonus").default(0), // Bonus coins
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Broadcasts (admin announcements)
export const broadcasts = pgTable("broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  target: broadcastTargetEnum("target").notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Withdrawal requests
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Amount in rupees
  coins: integer("coins").notNull(), // Equivalent coins being withdrawn
  bankDetails: jsonb("bank_details"), // Bank account info
  upiId: varchar("upi_id"), // UPI ID for payments
  status: withdrawalStatusEnum("status").default('pending').notNull(),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  adminComments: text("admin_comments"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // first_upload, 100_views, etc.
  title: varchar("title").notNull(),
  description: text("description"),
  badgeIcon: varchar("badge_icon"),
  badgeColor: varchar("badge_color"),
  coinsRewarded: integer("coins_rewarded").default(0),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Admin Panel Activity Logs
export const adminActivityLogs = pgTable("admin_activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id).notNull(),
  action: varchar("action").notNull(), // 'note_approved', 'note_rejected', 'user_viewed', etc.
  targetType: varchar("target_type").notNull(), // 'note', 'user', 'transaction'
  targetId: varchar("target_id").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional data about the action
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin Panel Sessions
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").references(() => users.id).notNull(),
  token: varchar("token").notNull().unique(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  lastActivity: timestamp("last_activity").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // upload_note, get_views, etc.
  target: integer("target").notNull(), // Target number
  reward: integer("reward").notNull(), // Coins reward
  isActive: boolean("is_active").default(true),
  validUntil: timestamp("valid_until").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User challenge progress
export const userChallengeProgress = pgTable("user_challenge_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  challengeId: varchar("challenge_id").references(() => dailyChallenges.id).notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const educationalCategoriesRelations = relations(educationalCategories, ({ many }) => ({
  userPreferences: many(userEducationalPreferences),
  notes: many(notes),
}));

export const userEducationalPreferencesRelations = relations(userEducationalPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userEducationalPreferences.userId],
    references: [users.id],
  }),
  category: one(educationalCategories, {
    fields: [userEducationalPreferences.categoryId],
    references: [educationalCategories.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  topperProfile: one(topperProfiles, {
    fields: [users.id],
    references: [topperProfiles.userId],
  }),
  educationalPreferences: many(userEducationalPreferences),
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
  noteViews: many(noteViews),
  noteLikes: many(noteLikes),
  forumPosts: many(forumPosts),
  forumReplies: many(forumReplies),
  forumReplyLikes: many(forumReplyLikes),
  broadcasts: many(broadcasts),
  achievements: many(userAchievements),
  challengeProgress: many(userChallengeProgress),
  withdrawalRequests: many(withdrawalRequests),
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
  category: one(educationalCategories, {
    fields: [notes.categoryId],
    references: [educationalCategories.id],
  }),
  reviewTasks: many(reviewTasks),
  feedback: many(feedback),
  downloads: many(downloads),
  views: many(noteViews),
  likes: many(noteLikes),
  transactions: many(transactions),
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

export const noteViewsRelations = relations(noteViews, ({ one }) => ({
  note: one(notes, {
    fields: [noteViews.noteId],
    references: [notes.id],
  }),
  viewer: one(users, {
    fields: [noteViews.viewerId],
    references: [users.id],
  }),
}));

export const noteLikesRelations = relations(noteLikes, ({ one }) => ({
  note: one(notes, {
    fields: [noteLikes.noteId],
    references: [notes.id],
  }),
  user: one(users, {
    fields: [noteLikes.userId],
    references: [users.id],
  }),
}));

export const forumCategoriesRelations = relations(forumCategories, ({ many }) => ({
  posts: many(forumPosts),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [forumPosts.authorId],
    references: [users.id],
  }),
  category: one(forumCategories, {
    fields: [forumPosts.categoryId],
    references: [forumCategories.id],
  }),
  replies: many(forumReplies),
  lastReplyBy: one(users, {
    fields: [forumPosts.lastReplyById],
    references: [users.id],
  }),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one, many }) => ({
  author: one(users, {
    fields: [forumReplies.authorId],
    references: [users.id],
  }),
  post: one(forumPosts, {
    fields: [forumReplies.postId],
    references: [forumPosts.id],
  }),
  parentReply: one(forumReplies, {
    fields: [forumReplies.parentReplyId],
    references: [forumReplies.id],
  }),
  childReplies: many(forumReplies),
  likes: many(forumReplyLikes),
}));

export const forumReplyLikesRelations = relations(forumReplyLikes, ({ one }) => ({
  reply: one(forumReplies, {
    fields: [forumReplyLikes.replyId],
    references: [forumReplies.id],
  }),
  user: one(users, {
    fields: [forumReplyLikes.userId],
    references: [users.id],
  }),
}));

export const broadcastsRelations = relations(broadcasts, ({ one }) => ({
  sender: one(users, {
    fields: [broadcasts.senderId],
    references: [users.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}));

export const dailyChallengesRelations = relations(dailyChallenges, ({ many }) => ({
  userProgress: many(userChallengeProgress),
}));

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, {
    fields: [userChallengeProgress.userId],
    references: [users.id],
  }),
  challenge: one(dailyChallenges, {
    fields: [userChallengeProgress.challengeId],
    references: [dailyChallenges.id],
  }),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  topper: one(users, {
    fields: [withdrawalRequests.topperId],
    references: [users.id],
  }),
  processedByAdmin: one(users, {
    fields: [withdrawalRequests.processedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertEducationalCategorySchema = createInsertSchema(educationalCategories).omit({
  id: true,
  createdAt: true,
});

export const insertUserEducationalPreferenceSchema = createInsertSchema(userEducationalPreferences).omit({
  id: true,
  createdAt: true,
});

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

export const insertNoteViewSchema = createInsertSchema(noteViews).omit({
  id: true,
  viewedAt: true,
});

export const insertNoteLikeSchema = createInsertSchema(noteLikes).omit({
  id: true,
  createdAt: true,
});

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
  createdAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoinPackageSchema = createInsertSchema(coinPackages).omit({
  id: true,
  createdAt: true,
});

export const insertBroadcastSchema = createInsertSchema(broadcasts).omit({
  id: true,
  sentAt: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({
  id: true,
  createdAt: true,
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  requestedAt: true,
  createdAt: true,
});

// Types
export type EducationalCategory = typeof educationalCategories.$inferSelect;
export type InsertEducationalCategory = z.infer<typeof insertEducationalCategorySchema>;
export type UserEducationalPreference = typeof userEducationalPreferences.$inferSelect;
export type InsertUserEducationalPreference = z.infer<typeof insertUserEducationalPreferenceSchema>;
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

// New types
export type NoteView = typeof noteViews.$inferSelect;
export type InsertNoteView = z.infer<typeof insertNoteViewSchema>;
export type NoteLike = typeof noteLikes.$inferSelect;
export type InsertNoteLike = z.infer<typeof insertNoteLikeSchema>;
export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReplyLike = typeof forumReplyLikes.$inferSelect;
export type CoinPackage = typeof coinPackages.$inferSelect;
export type InsertCoinPackage = z.infer<typeof insertCoinPackageSchema>;
export type Broadcast = typeof broadcasts.$inferSelect;
export type InsertBroadcast = z.infer<typeof insertBroadcastSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;
export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
