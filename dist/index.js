var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  boardEnum: () => boardEnum,
  broadcastTargetEnum: () => broadcastTargetEnum,
  broadcasts: () => broadcasts,
  broadcastsRelations: () => broadcastsRelations,
  categoryTypeEnum: () => categoryTypeEnum,
  classLevelEnum: () => classLevelEnum,
  coinPackages: () => coinPackages,
  dailyChallenges: () => dailyChallenges,
  dailyChallengesRelations: () => dailyChallengesRelations,
  downloads: () => downloads,
  downloadsRelations: () => downloadsRelations,
  educationalCategories: () => educationalCategories,
  educationalCategoriesRelations: () => educationalCategoriesRelations,
  engineeringBranchEnum: () => engineeringBranchEnum,
  examTypeEnum: () => examTypeEnum,
  feedback: () => feedback,
  feedbackRelations: () => feedbackRelations,
  follows: () => follows,
  followsRelations: () => followsRelations,
  forumCategories: () => forumCategories,
  forumCategoriesRelations: () => forumCategoriesRelations,
  forumCategoryEnum: () => forumCategoryEnum,
  forumPosts: () => forumPosts,
  forumPostsRelations: () => forumPostsRelations,
  forumReplies: () => forumReplies,
  forumRepliesRelations: () => forumRepliesRelations,
  forumReplyLikes: () => forumReplyLikes,
  forumReplyLikesRelations: () => forumReplyLikesRelations,
  insertBroadcastSchema: () => insertBroadcastSchema,
  insertCoinPackageSchema: () => insertCoinPackageSchema,
  insertDailyChallengeSchema: () => insertDailyChallengeSchema,
  insertEducationalCategorySchema: () => insertEducationalCategorySchema,
  insertFeedbackSchema: () => insertFeedbackSchema,
  insertForumCategorySchema: () => insertForumCategorySchema,
  insertForumPostSchema: () => insertForumPostSchema,
  insertForumReplySchema: () => insertForumReplySchema,
  insertNoteLikeSchema: () => insertNoteLikeSchema,
  insertNoteSchema: () => insertNoteSchema,
  insertNoteViewSchema: () => insertNoteViewSchema,
  insertReviewTaskSchema: () => insertReviewTaskSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertTopperProfileSchema: () => insertTopperProfileSchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserChallengeProgressSchema: () => insertUserChallengeProgressSchema,
  insertUserEducationalPreferenceSchema: () => insertUserEducationalPreferenceSchema,
  insertUserSchema: () => insertUserSchema,
  insertWithdrawalRequestSchema: () => insertWithdrawalRequestSchema,
  medicalBranchEnum: () => medicalBranchEnum,
  noteLikes: () => noteLikes,
  noteLikesRelations: () => noteLikesRelations,
  noteStatusEnum: () => noteStatusEnum,
  noteTypeEnum: () => noteTypeEnum,
  noteViews: () => noteViews,
  noteViewsRelations: () => noteViewsRelations,
  notes: () => notes,
  notesRelations: () => notesRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  payoutStatusEnum: () => payoutStatusEnum,
  payouts: () => payouts,
  payoutsRelations: () => payoutsRelations,
  reviewStatusEnum: () => reviewStatusEnum,
  reviewTasks: () => reviewTasks,
  reviewTasksRelations: () => reviewTasksRelations,
  roleEnum: () => roleEnum,
  sessions: () => sessions,
  subjectEnum: () => subjectEnum,
  subscriptionStatusEnum: () => subscriptionStatusEnum,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  topperProfiles: () => topperProfiles,
  topperProfilesRelations: () => topperProfilesRelations,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  userAchievements: () => userAchievements,
  userAchievementsRelations: () => userAchievementsRelations,
  userChallengeProgress: () => userChallengeProgress,
  userChallengeProgressRelations: () => userChallengeProgressRelations,
  userEducationalPreferences: () => userEducationalPreferences,
  userEducationalPreferencesRelations: () => userEducationalPreferencesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  withdrawalRequests: () => withdrawalRequests,
  withdrawalRequestsRelations: () => withdrawalRequestsRelations,
  withdrawalStatusEnum: () => withdrawalStatusEnum
});
import { sql } from "drizzle-orm";
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
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var roleEnum = pgEnum("role", ["student", "topper", "reviewer", "admin"]);
var noteStatusEnum = pgEnum("note_status", ["draft", "submitted", "approved", "published", "rejected", "archived"]);
var reviewStatusEnum = pgEnum("review_status", ["open", "changes_requested", "approved", "rejected"]);
var subscriptionStatusEnum = pgEnum("subscription_status", ["active", "inactive", "cancelled", "past_due"]);
var payoutStatusEnum = pgEnum("payout_status", ["pending", "approved", "paid"]);
var withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "approved", "rejected", "settled"]);
var noteTypeEnum = pgEnum("note_type", ["notes", "homework"]);
var transactionTypeEnum = pgEnum("transaction_type", ["coin_earned", "coin_spent", "coin_purchased", "download_free", "download_paid", "upload_reward"]);
var forumCategoryEnum = pgEnum("forum_category", ["latest_news", "revolutionary_ideas", "assignment_discussions", "general", "help_support"]);
var broadcastTargetEnum = pgEnum("broadcast_target", ["all_users", "students", "toppers", "reviewers"]);
var categoryTypeEnum = pgEnum("category_type", ["school", "competitive_exam", "professional_exam", "college", "certification"]);
var classLevelEnum = pgEnum("class_level", ["6", "7", "8", "9", "10", "11", "12"]);
var boardEnum = pgEnum("board", ["CBSE", "ICSE", "State_Board", "IB", "IGCSE"]);
var subjectEnum = pgEnum("subject", [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Computer_Science",
  "Economics",
  "Accountancy",
  "Business_Studies",
  "Political_Science",
  "History",
  "Geography",
  "Sociology",
  "Psychology",
  "Philosophy",
  "Physical_Education",
  "Fine_Arts",
  "Music",
  "Sanskrit",
  "French",
  "German",
  "Spanish",
  "Japanese",
  "Statistics",
  "Home_Science",
  "Biotechnology",
  "Engineering_Graphics",
  "Agriculture",
  "Environmental_Science"
]);
var examTypeEnum = pgEnum("exam_type", [
  "JEE_Main",
  "JEE_Advanced",
  "NEET_UG",
  "NEET_PG",
  "CUET_UG",
  "CUET_PG",
  "GATE",
  "CAT",
  "MAT",
  "XAT",
  "SNAP",
  "NMAT",
  "CMAT",
  "UPSC_CSE",
  "UPSC_IES",
  "UPSC_CDS",
  "SSC_CGL",
  "SSC_CHSL",
  "SSC_CPO",
  "SSC_MTS",
  "RRB_NTPC",
  "RRB_Group_D",
  "SBI_PO",
  "IBPS_PO",
  "IBPS_Clerk",
  "RBI_Grade_B",
  "NABARD",
  "LIC_AAO",
  "NICL_AO",
  "State_PSC",
  "Teacher_Eligibility",
  "NDA",
  "CDS",
  "AFCAT",
  "CAPF",
  "UGC_NET",
  "CSIR_NET",
  "ICAR_NET",
  "ICAI_CA",
  "ICWA_CMA",
  "CS_Foundation",
  "CLAT",
  "AILET",
  "LSAT",
  "Medical_Entrance",
  "Engineering_Entrance"
]);
var engineeringBranchEnum = pgEnum("engineering_branch", [
  "Computer_Science",
  "Information_Technology",
  "Electronics_Communication",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Aerospace",
  "Biotechnology",
  "Automobile",
  "Industrial",
  "Mining",
  "Metallurgical",
  "Textile",
  "Food_Technology",
  "Environmental",
  "Marine",
  "Petroleum",
  "Agricultural",
  "Biomedical",
  "Robotics",
  "AI_ML",
  "Data_Science",
  "Cyber_Security"
]);
var medicalBranchEnum = pgEnum("medical_branch", [
  "MBBS_General",
  "Anatomy",
  "Physiology",
  "Biochemistry",
  "Pathology",
  "Pharmacology",
  "Microbiology",
  "Forensic_Medicine",
  "Community_Medicine",
  "Internal_Medicine",
  "Surgery",
  "Obstetrics_Gynecology",
  "Pediatrics",
  "Orthopedics",
  "Ophthalmology",
  "ENT",
  "Dermatology",
  "Psychiatry",
  "Radiology",
  "Anesthesiology",
  "Emergency_Medicine",
  "Cardiology",
  "Neurology",
  "Gastroenterology",
  "Pulmonology",
  "Nephrology",
  "Endocrinology",
  "Oncology",
  "Urology",
  "Plastic_Surgery",
  "Neurosurgery",
  "Cardiac_Surgery",
  "Dental",
  "Nursing",
  "Pharmacy",
  "Physiotherapy",
  "Occupational_Therapy",
  "Medical_Lab_Technology",
  "Radiology_Technology"
]);
var educationalCategories = pgTable("educational_categories", {
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
  createdAt: timestamp("created_at").defaultNow()
});
var userEducationalPreferences = pgTable("user_educational_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  categoryId: varchar("category_id").references(() => educationalCategories.id).notNull(),
  isPrimary: boolean("is_primary").default(false),
  // Primary category for user
  createdAt: timestamp("created_at").defaultNow()
});
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: roleEnum("role").default("student").notNull(),
  phone: varchar("phone"),
  isActive: boolean("is_active").default(true).notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  coinBalance: integer("coin_balance").default(100).notNull(),
  // Starting bonus
  freeDownloadsLeft: integer("free_downloads_left").default(3).notNull(),
  // Free downloads per day
  lastFreeDownloadReset: timestamp("last_free_download_reset").defaultNow(),
  reputation: integer("reputation").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  // Login streak
  totalEarned: integer("total_earned").default(0).notNull(),
  totalSpent: integer("total_spent").default(0).notNull(),
  // Educational preferences
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var topperProfiles = pgTable("topper_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bio: text("bio"),
  subjects: text("subjects").array(),
  achievements: text("achievements"),
  ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 }).default("0"),
  followersCount: integer("followers_count").default(0),
  totalDownloads: integer("total_downloads").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  subject: subjectEnum("subject").notNull(),
  topic: varchar("topic"),
  description: text("description"),
  attachments: text("attachments").array(),
  status: noteStatusEnum("status").default("draft").notNull(),
  type: noteTypeEnum("type").default("notes").notNull(),
  version: integer("version").default(1),
  slug: varchar("slug").unique(),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  featured: boolean("featured").default(false),
  downloadsCount: integer("downloads_count").default(0),
  viewsCount: integer("views_count").default(0),
  likesCount: integer("likes_count").default(0),
  price: integer("price").default(5).notNull(),
  // Coins required to download
  isPremium: boolean("is_premium").default(false),
  tags: text("tags").array(),
  difficulty: varchar("difficulty"),
  // beginner, intermediate, advanced
  estimatedTime: integer("estimated_time"),
  // minutes to complete
  thumbnailUrl: varchar("thumbnail_url"),
  // Educational categorization
  categoryId: varchar("category_id").references(() => educationalCategories.id).notNull(),
  classGrade: varchar("class_grade"),
  // For backwards compatibility, will be deprecated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reviewTasks = pgTable("review_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  status: reviewStatusEnum("status").default("open").notNull(),
  comments: text("comments").array(),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow()
});
var subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  plan: varchar("plan").notNull(),
  // 'monthly' or 'yearly'
  startDate: timestamp("start_date").notNull(),
  renewalDate: timestamp("renewal_date").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  gateway: varchar("gateway").default("stripe"),
  gatewayCustomerId: varchar("gateway_customer_id"),
  gatewaySubId: varchar("gateway_sub_id"),
  createdAt: timestamp("created_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  // Coins amount
  coinChange: integer("coin_change").notNull(),
  // +/- coins
  noteId: varchar("note_id").references(() => notes.id),
  // For download transactions
  description: text("description"),
  metadata: jsonb("metadata"),
  // Additional data
  createdAt: timestamp("created_at").defaultNow()
});
var payouts = pgTable("payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  grossPoolShare: decimal("gross_pool_share", { precision: 10, scale: 2 }).notNull(),
  adjustments: decimal("adjustments", { precision: 10, scale: 2 }).default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  status: payoutStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paid_at"),
  method: varchar("method").default("manual"),
  createdAt: timestamp("created_at").defaultNow()
});
var follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow()
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  body: text("body"),
  read: boolean("read").default(false),
  link: varchar("link"),
  createdAt: timestamp("created_at").defaultNow()
});
var noteViews = pgTable("note_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  viewerId: varchar("viewer_id").references(() => users.id).notNull(),
  coinsEarned: integer("coins_earned").default(0),
  viewedAt: timestamp("viewed_at").defaultNow()
});
var noteLikes = pgTable("note_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").references(() => notes.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  color: varchar("color"),
  category: forumCategoryEnum("category").notNull(),
  postsCount: integer("posts_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var forumPosts = pgTable("forum_posts", {
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
  updatedAt: timestamp("updated_at").defaultNow()
});
var forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  postId: varchar("post_id").references(() => forumPosts.id).notNull(),
  parentReplyId: varchar("parent_reply_id"),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var forumReplyLikes = pgTable("forum_reply_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  replyId: varchar("reply_id").references(() => forumReplies.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var coinPackages = pgTable("coin_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  coins: integer("coins").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("INR"),
  isActive: boolean("is_active").default(true),
  bonus: integer("bonus").default(0),
  // Bonus coins
  isPopular: boolean("is_popular").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var broadcasts = pgTable("broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  target: broadcastTargetEnum("target").notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topperId: varchar("topper_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  // Amount in rupees
  coins: integer("coins").notNull(),
  // Equivalent coins being withdrawn
  bankDetails: jsonb("bank_details"),
  // Bank account info
  upiId: varchar("upi_id"),
  // UPI ID for payments
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  adminComments: text("admin_comments"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow()
});
var userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(),
  // first_upload, 100_views, etc.
  title: varchar("title").notNull(),
  description: text("description"),
  badgeIcon: varchar("badge_icon"),
  badgeColor: varchar("badge_color"),
  coinsRewarded: integer("coins_rewarded").default(0),
  unlockedAt: timestamp("unlocked_at").defaultNow()
});
var dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(),
  // upload_note, get_views, etc.
  target: integer("target").notNull(),
  // Target number
  reward: integer("reward").notNull(),
  // Coins reward
  isActive: boolean("is_active").default(true),
  validUntil: timestamp("valid_until").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var userChallengeProgress = pgTable("user_challenge_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  challengeId: varchar("challenge_id").references(() => dailyChallenges.id).notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var educationalCategoriesRelations = relations(educationalCategories, ({ many }) => ({
  userPreferences: many(userEducationalPreferences),
  notes: many(notes)
}));
var userEducationalPreferencesRelations = relations(userEducationalPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userEducationalPreferences.userId],
    references: [users.id]
  }),
  category: one(educationalCategories, {
    fields: [userEducationalPreferences.categoryId],
    references: [educationalCategories.id]
  })
}));
var usersRelations = relations(users, ({ one, many }) => ({
  topperProfile: one(topperProfiles, {
    fields: [users.id],
    references: [topperProfiles.userId]
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
  withdrawalRequests: many(withdrawalRequests)
}));
var topperProfilesRelations = relations(topperProfiles, ({ one }) => ({
  user: one(users, {
    fields: [topperProfiles.userId],
    references: [users.id]
  })
}));
var notesRelations = relations(notes, ({ one, many }) => ({
  topper: one(users, {
    fields: [notes.topperId],
    references: [users.id],
    relationName: "topperNotes"
  }),
  reviewer: one(users, {
    fields: [notes.reviewerId],
    references: [users.id],
    relationName: "reviewerNotes"
  }),
  category: one(educationalCategories, {
    fields: [notes.categoryId],
    references: [educationalCategories.id]
  }),
  reviewTasks: many(reviewTasks),
  feedback: many(feedback),
  downloads: many(downloads),
  views: many(noteViews),
  likes: many(noteLikes),
  transactions: many(transactions)
}));
var reviewTasksRelations = relations(reviewTasks, ({ one }) => ({
  note: one(notes, {
    fields: [reviewTasks.noteId],
    references: [notes.id]
  }),
  reviewer: one(users, {
    fields: [reviewTasks.reviewerId],
    references: [users.id]
  })
}));
var feedbackRelations = relations(feedback, ({ one }) => ({
  note: one(notes, {
    fields: [feedback.noteId],
    references: [notes.id]
  }),
  student: one(users, {
    fields: [feedback.studentId],
    references: [users.id]
  })
}));
var subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  student: one(users, {
    fields: [subscriptions.studentId],
    references: [users.id]
  })
}));
var transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  })
}));
var payoutsRelations = relations(payouts, ({ one }) => ({
  topper: one(users, {
    fields: [payouts.topperId],
    references: [users.id]
  })
}));
var followsRelations = relations(follows, ({ one }) => ({
  student: one(users, {
    fields: [follows.studentId],
    references: [users.id],
    relationName: "studentFollows"
  }),
  topper: one(users, {
    fields: [follows.topperId],
    references: [users.id],
    relationName: "topperFollows"
  })
}));
var downloadsRelations = relations(downloads, ({ one }) => ({
  student: one(users, {
    fields: [downloads.studentId],
    references: [users.id]
  }),
  note: one(notes, {
    fields: [downloads.noteId],
    references: [notes.id]
  })
}));
var notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));
var noteViewsRelations = relations(noteViews, ({ one }) => ({
  note: one(notes, {
    fields: [noteViews.noteId],
    references: [notes.id]
  }),
  viewer: one(users, {
    fields: [noteViews.viewerId],
    references: [users.id]
  })
}));
var noteLikesRelations = relations(noteLikes, ({ one }) => ({
  note: one(notes, {
    fields: [noteLikes.noteId],
    references: [notes.id]
  }),
  user: one(users, {
    fields: [noteLikes.userId],
    references: [users.id]
  })
}));
var forumCategoriesRelations = relations(forumCategories, ({ many }) => ({
  posts: many(forumPosts)
}));
var forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [forumPosts.authorId],
    references: [users.id]
  }),
  category: one(forumCategories, {
    fields: [forumPosts.categoryId],
    references: [forumCategories.id]
  }),
  replies: many(forumReplies),
  lastReplyBy: one(users, {
    fields: [forumPosts.lastReplyById],
    references: [users.id]
  })
}));
var forumRepliesRelations = relations(forumReplies, ({ one, many }) => ({
  author: one(users, {
    fields: [forumReplies.authorId],
    references: [users.id]
  }),
  post: one(forumPosts, {
    fields: [forumReplies.postId],
    references: [forumPosts.id]
  }),
  parentReply: one(forumReplies, {
    fields: [forumReplies.parentReplyId],
    references: [forumReplies.id]
  }),
  childReplies: many(forumReplies),
  likes: many(forumReplyLikes)
}));
var forumReplyLikesRelations = relations(forumReplyLikes, ({ one }) => ({
  reply: one(forumReplies, {
    fields: [forumReplyLikes.replyId],
    references: [forumReplies.id]
  }),
  user: one(users, {
    fields: [forumReplyLikes.userId],
    references: [users.id]
  })
}));
var broadcastsRelations = relations(broadcasts, ({ one }) => ({
  sender: one(users, {
    fields: [broadcasts.senderId],
    references: [users.id]
  })
}));
var userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  })
}));
var dailyChallengesRelations = relations(dailyChallenges, ({ many }) => ({
  userProgress: many(userChallengeProgress)
}));
var userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, {
    fields: [userChallengeProgress.userId],
    references: [users.id]
  }),
  challenge: one(dailyChallenges, {
    fields: [userChallengeProgress.challengeId],
    references: [dailyChallenges.id]
  })
}));
var withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  topper: one(users, {
    fields: [withdrawalRequests.topperId],
    references: [users.id]
  }),
  processedByAdmin: one(users, {
    fields: [withdrawalRequests.processedBy],
    references: [users.id]
  })
}));
var insertEducationalCategorySchema = createInsertSchema(educationalCategories).omit({
  id: true,
  createdAt: true
});
var insertUserEducationalPreferenceSchema = createInsertSchema(userEducationalPreferences).omit({
  id: true,
  createdAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTopperProfileSchema = createInsertSchema(topperProfiles).omit({
  id: true,
  createdAt: true
});
var insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertReviewTaskSchema = createInsertSchema(reviewTasks).omit({
  id: true,
  createdAt: true
});
var insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true
});
var insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true
});
var insertNoteViewSchema = createInsertSchema(noteViews).omit({
  id: true,
  viewedAt: true
});
var insertNoteLikeSchema = createInsertSchema(noteLikes).omit({
  id: true,
  createdAt: true
});
var insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
  createdAt: true
});
var insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCoinPackageSchema = createInsertSchema(coinPackages).omit({
  id: true,
  createdAt: true
});
var insertBroadcastSchema = createInsertSchema(broadcasts).omit({
  id: true,
  sentAt: true,
  createdAt: true
});
var insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true
});
var insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
  createdAt: true
});
var insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({
  id: true,
  createdAt: true
});
var insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  requestedAt: true,
  createdAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var db;
var pool;
if (process.env.USE_SQLITE === "1") {
  db = {};
} else {
  neonConfig.webSocketConstructor = ws;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema: schema_exports });
}

// server/storage.ts
import { eq, desc, and, or, like, sql as sql2, count, avg, sum } from "drizzle-orm";
import crypto from "crypto";
var InMemoryStorage = class {
  users = [];
  topperProfiles = [];
  notes = [];
  followsList = [];
  feedbackList = [];
  transactionsList = [];
  subscriptionsList = [];
  categories = [];
  constructor() {
    this.categories = [
      { id: "fallback-1", name: "Class 10th CBSE", description: "Class 10 CBSE Board", categoryType: "school", isActive: true, displayOrder: 1, icon: "\u{1F4DA}", color: "#3B82F6" },
      { id: "fallback-5", name: "JEE Main", description: "Joint Entrance Examination - Main", categoryType: "competitive_exam", isActive: true, displayOrder: 30, icon: "\u2699\uFE0F", color: "#059669" }
    ];
    const demoTopperId = crypto.randomUUID();
    this.users.push({
      id: demoTopperId,
      email: "topper@example.com",
      firstName: "Topper",
      lastName: "User",
      profileImageUrl: "",
      role: "topper",
      phone: null,
      isActive: true,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      coinBalance: 100,
      freeDownloadsLeft: 3,
      lastFreeDownloadReset: /* @__PURE__ */ new Date(),
      reputation: 0,
      streak: 0,
      totalEarned: 0,
      totalSpent: 0,
      onboardingCompleted: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    const demoNoteId = crypto.randomUUID();
    this.notes.push({
      id: demoNoteId,
      title: "Sample Physics Notes",
      subject: "Physics",
      topic: "Kinematics",
      description: "Introductory kinematics notes",
      attachments: ["/uploads/sample.pdf"],
      status: "published",
      type: "notes",
      version: 1,
      slug: "sample-physics-notes",
      topperId: demoTopperId,
      reviewerId: null,
      publishedAt: /* @__PURE__ */ new Date(),
      featured: false,
      downloadsCount: 0,
      viewsCount: 0,
      likesCount: 0,
      price: 0,
      isPremium: false,
      tags: [],
      difficulty: "beginner",
      estimatedTime: 20,
      thumbnailUrl: "",
      categoryId: this.categories[0].id,
      classGrade: "10",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
  }
  async getUser(id) {
    return this.users.find((u) => u.id === id);
  }
  async upsertUser(userData) {
    let user = this.users.find((u) => u.id === userData.id);
    if (!user) {
      const newUser = {
        id: userData.id || crypto.randomUUID(),
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        profileImageUrl: userData.profileImageUrl || "",
        role: userData.role || "student",
        phone: null,
        isActive: true,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        coinBalance: 100,
        freeDownloadsLeft: 3,
        lastFreeDownloadReset: /* @__PURE__ */ new Date(),
        reputation: 0,
        streak: 0,
        totalEarned: 0,
        totalSpent: 0,
        onboardingCompleted: false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.users.push(newUser);
      return newUser;
    }
    Object.assign(user, userData, { updatedAt: /* @__PURE__ */ new Date() });
    return user;
  }
  async getUserByEmail(email) {
    return this.users.find((u) => u.email === email);
  }
  async updateUserRole(id, role) {
    const user = this.users.find((u) => u.id === id);
    user.role = role;
    user.updatedAt = /* @__PURE__ */ new Date();
    return user;
  }
  async updateUserStripeInfo(id) {
    const user = this.users.find((u) => u.id === id);
    return user;
  }
  async createTopperProfile(profile) {
    const p = { id: crypto.randomUUID(), ...profile, createdAt: /* @__PURE__ */ new Date() };
    this.topperProfiles.push(p);
    return p;
  }
  async getTopperProfile(userId) {
    return this.topperProfiles.find((p) => p.userId === userId);
  }
  async updateTopperProfile(userId, updates) {
    const p = this.topperProfiles.find((tp) => tp.userId === userId);
    Object.assign(p, updates);
    return p;
  }
  async createNote(note) {
    const n = { id: crypto.randomUUID(), ...note, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
    this.notes.push(n);
    return n;
  }
  async getNoteById(id) {
    return this.notes.find((n) => n.id === id);
  }
  async getNotesByTopper(topperId) {
    return this.notes.filter((n) => n.topperId === topperId);
  }
  async getPublishedNotes(filters) {
    let list = this.notes.filter((n) => n.status === "published");
    if (filters?.subject) list = list.filter((n) => n.subject === filters.subject);
    if (filters?.classGrade) list = list.filter((n) => n.classGrade === filters.classGrade);
    if (filters?.categoryId) list = list.filter((n) => n.categoryId === filters.categoryId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((n) => (n.title + " " + (n.description || "")).toLowerCase().includes(q));
    }
    const total = list.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    return { notes: list.slice(offset, offset + limit), total };
  }
  async getAllNotesForAdmin(filters) {
    let list = [...this.notes];
    if (filters?.status) list = list.filter((n) => n.status === filters.status);
    if (filters?.subject) list = list.filter((n) => n.subject === filters.subject);
    const notesWithUsers = list.map((note) => {
      const user = this.users.find((u) => u.id === note.topperId);
      return {
        ...note,
        authorName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        authorEmail: user?.email || "unknown@email.com",
        authorRole: user?.role || "student"
      };
    });
    const total = notesWithUsers.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    return { notes: notesWithUsers.slice(offset, offset + limit), total };
  }
  async updateNote(id, updates) {
    const n = this.notes.find((n2) => n2.id === id);
    Object.assign(n, updates, { updatedAt: /* @__PURE__ */ new Date() });
    return n;
  }
  async updateNoteStatus(id, status) {
    const n = this.notes.find((n2) => n2.id === id);
    n.status = status;
    if (status === "published") n.publishedAt = /* @__PURE__ */ new Date();
    n.updatedAt = /* @__PURE__ */ new Date();
    return n;
  }
  // Stubs and simplified implementations
  async createReviewTask(task) {
    return { id: crypto.randomUUID(), ...task, createdAt: /* @__PURE__ */ new Date() };
  }
  async getReviewTasks() {
    return [];
  }
  async updateReviewTask(id, updates) {
    return { id, ...updates };
  }
  async createFeedback(fb) {
    const f = { id: crypto.randomUUID(), ...fb, createdAt: /* @__PURE__ */ new Date() };
    this.feedbackList.push(f);
    return f;
  }
  async getFeedbackByNote(noteId) {
    return this.feedbackList.filter((f) => f.noteId === noteId);
  }
  async getFeedbackByStudent(studentId, noteId) {
    return this.feedbackList.find((f) => f.studentId === studentId && f.noteId === noteId);
  }
  async createSubscription(s) {
    const sub = { id: crypto.randomUUID(), ...s, status: "active" };
    this.subscriptionsList.push(sub);
    return sub;
  }
  async getActiveSubscription(studentId) {
    return this.subscriptionsList.find((s) => s.studentId === studentId && s.status === "active");
  }
  async updateSubscriptionStatus(id, status) {
    const s = this.subscriptionsList.find((s2) => s2.id === id);
    s.status = status;
    return s;
  }
  async followTopper(studentId, topperId) {
    const f = { id: crypto.randomUUID(), studentId, topperId, createdAt: /* @__PURE__ */ new Date() };
    this.followsList.push(f);
    return f;
  }
  async unfollowTopper(studentId, topperId) {
    this.followsList = this.followsList.filter((f) => !(f.studentId === studentId && f.topperId === topperId));
  }
  async getFollows(studentId) {
    return this.followsList.filter((f) => f.studentId === studentId);
  }
  async recordDownload(studentId, noteId) {
    const d = { id: crypto.randomUUID(), studentId, noteId, downloadedAt: /* @__PURE__ */ new Date() };
    const n = this.notes.find((n2) => n2.id === noteId);
    if (n) n.downloadsCount += 1;
    return d;
  }
  async getDownloadHistory(studentId) {
    return [];
  }
  async getTopperAnalytics() {
    return { totalDownloads: 0, averageRating: 0, followersCount: 0, notesCount: this.notes.length };
  }
  async getAdminStats() {
    return { totalUsers: this.users.length, totalNotes: this.notes.length, activeSubscriptions: 0, pendingReviews: 0 };
  }
  async getNote(id) {
    return this.getNoteById(id);
  }
  async updateUserCoins(userId, coinChange) {
    const u = this.users.find((u2) => u2.id === userId);
    if (u) {
      u.coinBalance += coinChange;
      if (coinChange > 0) u.totalEarned += coinChange;
      if (coinChange < 0) u.totalSpent += Math.abs(coinChange);
    }
  }
  async recordTransaction(userId, type, amount, coinChange, noteId, description) {
    const t = { id: crypto.randomUUID(), userId, type, amount, coinChange, noteId, description, createdAt: /* @__PURE__ */ new Date() };
    this.transactionsList.push(t);
    return t;
  }
  async recordNoteView(viewerId, noteId, coinsEarned) {
    return { id: crypto.randomUUID(), viewerId, noteId, coinsEarned, viewedAt: /* @__PURE__ */ new Date() };
  }
  async hasUserViewedNoteToday() {
    return false;
  }
  async incrementNoteViews(noteId) {
    const n = this.notes.find((n2) => n2.id === noteId);
    if (n) n.viewsCount += 1;
  }
  async incrementNoteDownloads(noteId) {
    const n = this.notes.find((n2) => n2.id === noteId);
    if (n) n.downloadsCount += 1;
  }
  async toggleNoteLike(userId, noteId) {
    const n = this.notes.find((n2) => n2.id === noteId);
    if (!n) return false;
    const liked = n.__likes?.includes(userId) || false;
    n.__likes = n.__likes || [];
    if (liked) {
      n.__likes = n.__likes.filter((x) => x !== userId);
      n.likesCount = n.likesCount - 1;
      return false;
    } else {
      n.__likes.push(userId);
      n.likesCount = n.likesCount + 1;
      return true;
    }
  }
  async getNoteLikesCount(noteId) {
    const n = this.notes.find((n2) => n2.id === noteId);
    return n ? n.likesCount : 0;
  }
  async hasUserDownloaded() {
    return false;
  }
  async resetDailyFreeDownloads() {
  }
  async useFreeDowload() {
  }
  async getCoinPackages() {
    return [];
  }
  async getUserTransactions() {
    return [];
  }
  async getLeaderboard() {
    return [];
  }
  async getDailyChallenges() {
    return [];
  }
  async completeDailyChallenge() {
    return { completed: false, progress: 0 };
  }
  async createForumCategory(category) {
    return { id: crypto.randomUUID(), ...category, createdAt: /* @__PURE__ */ new Date() };
  }
  async getForumCategories() {
    return [];
  }
  async createForumPost(post) {
    return { id: crypto.randomUUID(), ...post, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
  }
  async getForumPosts() {
    return { posts: [], total: 0 };
  }
  async getForumPost() {
    return void 0;
  }
  async createForumReply(reply) {
    return { id: crypto.randomUUID(), ...reply, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() };
  }
  async getForumReplies() {
    return [];
  }
  async toggleForumReplyLike() {
    return false;
  }
  async createBroadcast(broadcast) {
    return { id: crypto.randomUUID(), ...broadcast, createdAt: /* @__PURE__ */ new Date(), sentAt: /* @__PURE__ */ new Date(), isActive: true };
  }
  async getBroadcasts() {
    return [];
  }
  async createUserAchievement(achievement) {
    return { id: crypto.randomUUID(), ...achievement, unlockedAt: /* @__PURE__ */ new Date() };
  }
  async getUserAchievements() {
    return [];
  }
  async getEducationalCategories() {
    return this.categories;
  }
  async saveUserEducationalPreferences() {
  }
  async getUserEducationalPreferences() {
    return [];
  }
  async completeUserOnboarding(userId) {
    const u = this.users.find((u2) => u2.id === userId);
    u.onboardingCompleted = true;
    return u;
  }
  async seedEducationalCategories() {
  }
  async getUploaderStats() {
    return { totalUploads: this.notes.length, publishedNotes: this.notes.length, totalDownloads: this.notes.reduce((a, n) => a + n.downloadsCount, 0), walletBalance: 0 };
  }
  async getWithdrawalRequests() {
    return [];
  }
  async createWithdrawalRequest(request) {
    return { id: crypto.randomUUID(), ...request, status: "pending", requestedAt: /* @__PURE__ */ new Date() };
  }
  async getAllWithdrawalRequests() {
    return [];
  }
  async approveWithdrawalRequest(id, adminId) {
    return { id, topperId: adminId, amount: 0, coins: 0, status: "approved", requestedAt: /* @__PURE__ */ new Date(), processedAt: /* @__PURE__ */ new Date(), processedBy: adminId };
  }
  async rejectWithdrawalRequest(id, adminId, reason) {
    return { id, topperId: adminId, amount: 0, coins: 0, status: "rejected", requestedAt: /* @__PURE__ */ new Date(), processedAt: /* @__PURE__ */ new Date(), processedBy: adminId, rejectionReason: reason };
  }
  async settleWithdrawalRequest(id, adminId, comments) {
    return { id, topperId: adminId, amount: 0, coins: 0, status: "settled", requestedAt: /* @__PURE__ */ new Date(), processedAt: /* @__PURE__ */ new Date(), processedBy: adminId, adminComments: comments };
  }
  // User Activity Operations
  async getUserActivity() {
    const activities = [];
    const actions = ["login", "download", "upload", "view_note", "like_note", "follow_user", "comment"];
    const users2 = this.users.slice(0, 5);
    for (let i = 0; i < 20; i++) {
      const user = users2[Math.floor(Math.random() * users2.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp2 = new Date(Date.now() - Math.random() * 36e5);
      activities.push({
        id: crypto.randomUUID(),
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        action,
        details: this.getActionDetails(action),
        timestamp: timestamp2.toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: "Mumbai, India"
      });
    }
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async getUserActivityById(userId) {
    const allActivities = await this.getUserActivity();
    return allActivities.filter((activity) => activity.userId === userId);
  }
  async recordUserActivity(userId, action, details) {
    console.log(`User ${userId} performed action: ${action}`, details);
  }
  async getUserStats(userId) {
    const user = this.users.find((u) => u.id === userId);
    const userNotes = this.notes.filter((n) => n.topperId === userId);
    const userDownloads = this.followsList.filter((f) => f.studentId === userId);
    const totalDownloads = userNotes.reduce((sum2, note) => sum2 + (note.downloadsCount || 0), 0);
    const totalViews = userNotes.reduce((sum2, note) => sum2 + (note.viewsCount || 0), 0);
    const activeNotes = userNotes.filter((n) => n.status === "published").length;
    const allFeedback = this.feedbackList.filter(
      (f) => userNotes.some((note) => note.id === f.noteId)
    );
    const averageRating = allFeedback.length > 0 ? allFeedback.reduce((sum2, f) => sum2 + f.rating, 0) / allFeedback.length : 0;
    return {
      notesUploaded: userNotes.length,
      totalEarnings: user?.totalEarned || 0,
      totalDownloads,
      averageRating,
      monthlyEarnings: Math.floor((user?.totalEarned || 0) * 0.3),
      // Simulate monthly earnings
      totalViews,
      activeNotes,
      pendingReviews: userNotes.filter((n) => n.status === "submitted").length
    };
  }
  async getUserSubjectStats(userId) {
    const userNotes = this.notes.filter((n) => n.topperId === userId);
    const subjectMap = /* @__PURE__ */ new Map();
    for (const note of userNotes) {
      const subject = note.subject;
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, {
          subject,
          notesCount: 0,
          earnings: 0,
          downloads: 0,
          averageRating: 0,
          ratings: []
        });
      }
      const stats = subjectMap.get(subject);
      stats.notesCount++;
      stats.downloads += note.downloadsCount || 0;
      stats.earnings += (note.downloadsCount || 0) * 5;
      const noteFeedback = this.feedbackList.filter((f) => f.noteId === note.id);
      stats.ratings.push(...noteFeedback.map((f) => f.rating));
    }
    const result = Array.from(subjectMap.values()).map((stats) => ({
      subject: stats.subject,
      notesCount: stats.notesCount,
      earnings: stats.earnings,
      downloads: stats.downloads,
      averageRating: stats.ratings.length > 0 ? stats.ratings.reduce((sum2, rating) => sum2 + rating, 0) / stats.ratings.length : 0
    }));
    return result;
  }
  async updateUserStats(userId, uploadData) {
    console.log(`Updated stats for user ${userId} after uploading ${uploadData.subject} note ${uploadData.noteId}`);
  }
  getActionDetails(action) {
    const detailsMap = {
      "login": { page: "/login", sessionDuration: "2h 15m" },
      "download": { noteTitle: "Physics Notes - Kinematics", noteId: crypto.randomUUID() },
      "upload": { noteTitle: "Chemistry Notes - Organic", noteId: crypto.randomUUID() },
      "view_note": { noteTitle: "Mathematics Notes - Calculus", noteId: crypto.randomUUID() },
      "like_note": { noteTitle: "Biology Notes - Cell Structure", noteId: crypto.randomUUID() },
      "follow_user": { followedUser: "Dr. Sarah Johnson", followedUserId: crypto.randomUUID() },
      "comment": { noteTitle: "History Notes - World War II", comment: "Great notes!" }
    };
    return detailsMap[action] || {};
  }
};
var DatabaseStorage = class {
  // User operations (required for Replit Auth)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // User management
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async updateUserRole(id, role) {
    const [user] = await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  async updateUserStripeInfo(id, customerId, subscriptionId) {
    const [user] = await db.update(users).set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }
  // Topper profile operations
  async createTopperProfile(profile) {
    const [topperProfile] = await db.insert(topperProfiles).values(profile).returning();
    return topperProfile;
  }
  async getTopperProfile(userId) {
    const [profile] = await db.select().from(topperProfiles).where(eq(topperProfiles.userId, userId));
    return profile;
  }
  async updateTopperProfile(userId, updates) {
    const [profile] = await db.update(topperProfiles).set(updates).where(eq(topperProfiles.userId, userId)).returning();
    return profile;
  }
  // Note operations
  async createNote(note) {
    const [createdNote] = await db.insert(notes).values(note).returning();
    return createdNote;
  }
  async getNoteById(id) {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }
  async getNotesByTopper(topperId) {
    return await db.select().from(notes).where(eq(notes.topperId, topperId)).orderBy(desc(notes.createdAt));
  }
  async getPublishedNotes(filters) {
    const conditions = [eq(notes.status, "published")];
    if (filters?.subject) {
      conditions.push(eq(notes.subject, filters.subject));
    }
    if (filters?.classGrade) {
      conditions.push(eq(notes.classGrade, filters.classGrade));
    }
    if (filters?.categoryId) {
      conditions.push(eq(notes.categoryId, filters.categoryId));
    }
    if (filters?.search) {
      conditions.push(
        or(
          like(notes.title, `%${filters.search}%`),
          like(notes.description, `%${filters.search}%`),
          like(notes.topic, `%${filters.search}%`)
        )
      );
    }
    const [notesResult, totalResult] = await Promise.all([
      db.select({
        id: notes.id,
        title: notes.title,
        subject: notes.subject,
        topic: notes.topic,
        description: notes.description,
        status: notes.status,
        type: notes.type,
        topperId: notes.topperId,
        publishedAt: notes.publishedAt,
        downloadsCount: notes.downloadsCount,
        viewsCount: notes.viewsCount,
        likesCount: notes.likesCount,
        price: notes.price,
        categoryId: notes.categoryId,
        classGrade: notes.classGrade,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt
      }).from(notes).where(and(...conditions)).orderBy(desc(notes.publishedAt)).limit(filters?.limit || 20).offset(filters?.offset || 0),
      db.select({ count: count() }).from(notes).where(and(...conditions))
    ]);
    return {
      notes: notesResult,
      total: totalResult[0].count
    };
  }
  async getAllNotesForAdmin(filters) {
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(notes.status, filters.status));
    }
    if (filters?.subject) {
      conditions.push(eq(notes.subject, filters.subject));
    }
    const [notesResult, totalResult] = await Promise.all([
      db.select({
        id: notes.id,
        title: notes.title,
        subject: notes.subject,
        topic: notes.topic,
        description: notes.description,
        status: notes.status,
        type: notes.type,
        topperId: notes.topperId,
        publishedAt: notes.publishedAt,
        downloadsCount: notes.downloadsCount,
        viewsCount: notes.viewsCount,
        likesCount: notes.likesCount,
        price: notes.price,
        categoryId: notes.categoryId,
        classGrade: notes.classGrade,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        attachments: notes.attachments,
        // Join with users to get author info
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorEmail: users.email,
        authorRole: users.role
      }).from(notes).leftJoin(users, eq(notes.topperId, users.id)).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(notes.createdAt)).limit(filters?.limit || 20).offset(filters?.offset || 0),
      db.select({ count: count() }).from(notes).where(conditions.length > 0 ? and(...conditions) : void 0)
    ]);
    const notesWithUsers = notesResult.map((note) => ({
      ...note,
      authorName: `${note.authorFirstName || ""} ${note.authorLastName || ""}`.trim() || "Unknown",
      authorEmail: note.authorEmail || "unknown@email.com",
      authorRole: note.authorRole || "student"
    }));
    return {
      notes: notesWithUsers,
      total: totalResult[0].count
    };
  }
  async updateNote(id, updates) {
    const [note] = await db.update(notes).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notes.id, id)).returning();
    return note;
  }
  async updateNoteStatus(id, status, reviewerId) {
    const updateData = {
      status,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (reviewerId) {
      updateData.reviewerId = reviewerId;
    }
    if (status === "published") {
      updateData.publishedAt = /* @__PURE__ */ new Date();
    }
    const [note] = await db.update(notes).set(updateData).where(eq(notes.id, id)).returning();
    return note;
  }
  // Review operations
  async createReviewTask(task) {
    const [reviewTask] = await db.insert(reviewTasks).values(task).returning();
    return reviewTask;
  }
  async getReviewTasks(reviewerId) {
    const conditions = [];
    if (reviewerId) {
      conditions.push(eq(reviewTasks.reviewerId, reviewerId));
    }
    return await db.select().from(reviewTasks).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(reviewTasks.createdAt));
  }
  async updateReviewTask(id, updates) {
    const [task] = await db.update(reviewTasks).set(updates).where(eq(reviewTasks.id, id)).returning();
    return task;
  }
  // Feedback operations
  async createFeedback(feedbackData) {
    const [feedbackRecord] = await db.insert(feedback).values(feedbackData).returning();
    return feedbackRecord;
  }
  async getFeedbackByNote(noteId) {
    return await db.select().from(feedback).where(eq(feedback.noteId, noteId)).orderBy(desc(feedback.createdAt));
  }
  async getFeedbackByStudent(studentId, noteId) {
    const [feedbackRecord] = await db.select().from(feedback).where(and(eq(feedback.studentId, studentId), eq(feedback.noteId, noteId)));
    return feedbackRecord;
  }
  // Subscription operations
  async createSubscription(subscription) {
    const [sub] = await db.insert(subscriptions).values(subscription).returning();
    return sub;
  }
  async getActiveSubscription(studentId) {
    const [subscription] = await db.select().from(subscriptions).where(and(eq(subscriptions.studentId, studentId), eq(subscriptions.status, "active"))).orderBy(desc(subscriptions.createdAt));
    return subscription;
  }
  async updateSubscriptionStatus(id, status) {
    const [subscription] = await db.update(subscriptions).set({ status }).where(eq(subscriptions.id, id)).returning();
    return subscription;
  }
  // Follow operations
  async followTopper(studentId, topperId) {
    const [follow] = await db.insert(follows).values({ studentId, topperId }).returning();
    return follow;
  }
  async unfollowTopper(studentId, topperId) {
    await db.delete(follows).where(and(eq(follows.studentId, studentId), eq(follows.topperId, topperId)));
  }
  async getFollows(studentId) {
    return await db.select().from(follows).where(eq(follows.studentId, studentId));
  }
  // Download operations
  async recordDownload(studentId, noteId) {
    const [download] = await db.insert(downloads).values({ studentId, noteId }).returning();
    await db.update(notes).set({
      downloadsCount: sql2`${notes.downloadsCount} + 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(notes.id, noteId));
    return download;
  }
  async getDownloadHistory(studentId) {
    return await db.select({
      id: downloads.id,
      noteId: downloads.noteId,
      downloadedAt: downloads.downloadedAt,
      note: {
        id: notes.id,
        title: notes.title,
        subject: notes.subject,
        type: notes.type,
        description: notes.description,
        createdAt: notes.createdAt
      }
    }).from(downloads).innerJoin(notes, eq(downloads.noteId, notes.id)).where(eq(downloads.studentId, studentId)).orderBy(desc(downloads.downloadedAt));
  }
  // Analytics
  async getTopperAnalytics(topperId) {
    const [downloadStats] = await db.select({
      totalDownloads: sum(notes.downloadsCount),
      notesCount: count(notes.id)
    }).from(notes).where(eq(notes.topperId, topperId));
    const [ratingStats] = await db.select({
      averageRating: avg(feedback.rating)
    }).from(feedback).innerJoin(notes, eq(notes.id, feedback.noteId)).where(eq(notes.topperId, topperId));
    const [followersStats] = await db.select({
      followersCount: count(follows.id)
    }).from(follows).where(eq(follows.topperId, topperId));
    return {
      totalDownloads: Number(downloadStats.totalDownloads) || 0,
      averageRating: Number(ratingStats.averageRating) || 0,
      followersCount: Number(followersStats.followersCount) || 0,
      notesCount: Number(downloadStats.notesCount) || 0
    };
  }
  // Admin operations
  async getAdminStats() {
    const [userStats] = await db.select({ totalUsers: count(users.id) }).from(users);
    const [noteStats] = await db.select({ totalNotes: count(notes.id) }).from(notes);
    const [subscriptionStats] = await db.select({ activeSubscriptions: count(subscriptions.id) }).from(subscriptions).where(eq(subscriptions.status, "active"));
    const [reviewStats] = await db.select({ pendingReviews: count(reviewTasks.id) }).from(reviewTasks).where(eq(reviewTasks.status, "open"));
    return {
      totalUsers: Number(userStats.totalUsers) || 0,
      totalNotes: Number(noteStats.totalNotes) || 0,
      activeSubscriptions: Number(subscriptionStats.activeSubscriptions) || 0,
      pendingReviews: Number(reviewStats.pendingReviews) || 0
    };
  }
  // Coin System Implementations
  async getNote(id) {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }
  async updateUserCoins(userId, coinChange) {
    await db.update(users).set({
      coinBalance: sql2`${users.coinBalance} + ${coinChange}`,
      totalEarned: coinChange > 0 ? sql2`${users.totalEarned} + ${coinChange}` : users.totalEarned,
      totalSpent: coinChange < 0 ? sql2`${users.totalSpent} + ${Math.abs(coinChange)}` : users.totalSpent,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async recordTransaction(userId, type, amount, coinChange, noteId, description) {
    const [transaction] = await db.insert(transactions).values({
      userId,
      type,
      amount,
      coinChange,
      noteId,
      description
    }).returning();
    return transaction;
  }
  async recordNoteView(viewerId, noteId, coinsEarned) {
    const [view] = await db.insert(noteViews).values({
      noteId,
      viewerId,
      coinsEarned
    }).returning();
    return view;
  }
  async hasUserViewedNoteToday(userId, noteId) {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const [view] = await db.select().from(noteViews).where(
      and(
        eq(noteViews.viewerId, userId),
        eq(noteViews.noteId, noteId),
        sql2`${noteViews.viewedAt} >= ${today}`
      )
    );
    return !!view;
  }
  async incrementNoteViews(noteId) {
    await db.update(notes).set({
      viewsCount: sql2`${notes.viewsCount} + 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(notes.id, noteId));
  }
  async incrementNoteDownloads(noteId) {
    await db.update(notes).set({
      downloadsCount: sql2`${notes.downloadsCount} + 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(notes.id, noteId));
  }
  async toggleNoteLike(userId, noteId) {
    const [existingLike] = await db.select().from(noteLikes).where(and(eq(noteLikes.userId, userId), eq(noteLikes.noteId, noteId)));
    if (existingLike) {
      await db.delete(noteLikes).where(and(eq(noteLikes.userId, userId), eq(noteLikes.noteId, noteId)));
      await db.update(notes).set({
        likesCount: sql2`${notes.likesCount} - 1`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(notes.id, noteId));
      return false;
    } else {
      await db.insert(noteLikes).values({ userId, noteId });
      await db.update(notes).set({
        likesCount: sql2`${notes.likesCount} + 1`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(notes.id, noteId));
      return true;
    }
  }
  async getNoteLikesCount(noteId) {
    const [result] = await db.select({ count: count(noteLikes.id) }).from(noteLikes).where(eq(noteLikes.noteId, noteId));
    return Number(result.count) || 0;
  }
  async hasUserDownloaded(userId, noteId) {
    const [download] = await db.select().from(downloads).where(and(eq(downloads.studentId, userId), eq(downloads.noteId, noteId)));
    return !!download;
  }
  async resetDailyFreeDownloads(userId) {
    const user = await this.getUser(userId);
    if (!user) return;
    const lastReset = user.lastFreeDownloadReset;
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    if (!lastReset || new Date(lastReset) < today) {
      await db.update(users).set({
        freeDownloadsLeft: 3,
        lastFreeDownloadReset: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.id, userId));
    }
  }
  async useFreeDowload(userId) {
    await db.update(users).set({
      freeDownloadsLeft: sql2`${users.freeDownloadsLeft} - 1`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async getCoinPackages() {
    return await db.select().from(coinPackages).where(eq(coinPackages.isActive, true)).orderBy(coinPackages.price);
  }
  async getUserTransactions(userId, page, limit) {
    const offset = (page - 1) * limit;
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(limit).offset(offset);
  }
  async getLeaderboard(type, limit) {
    if (type === "earnings") {
      return await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        totalEarned: users.totalEarned,
        reputation: users.reputation
      }).from(users).where(eq(users.isActive, true)).orderBy(desc(users.totalEarned)).limit(limit);
    } else if (type === "reputation") {
      return await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        reputation: users.reputation,
        totalEarned: users.totalEarned
      }).from(users).where(eq(users.isActive, true)).orderBy(desc(users.reputation)).limit(limit);
    }
    return [];
  }
  async getDailyChallenges(userId) {
    const activeChallenges = await db.select().from(dailyChallenges).where(
      and(
        eq(dailyChallenges.isActive, true),
        sql2`${dailyChallenges.validUntil} > NOW()`
      )
    );
    const challengesWithProgress = await Promise.all(
      activeChallenges.map(async (challenge) => {
        const progressResult = await db.select().from(userChallengeProgress).where(
          and(
            eq(userChallengeProgress.userId, userId),
            eq(userChallengeProgress.challengeId, challenge.id)
          )
        );
        const progress = progressResult[0];
        return {
          ...challenge,
          progress: progress?.progress || 0,
          completed: progress?.completed || false
        };
      })
    );
    return challengesWithProgress;
  }
  async completeDailyChallenge(userId, challengeId) {
    const [challenge] = await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, challengeId));
    if (!challenge) {
      throw new Error("Challenge not found");
    }
    const [progress] = await db.select().from(userChallengeProgress).where(
      and(
        eq(userChallengeProgress.userId, userId),
        eq(userChallengeProgress.challengeId, challengeId)
      )
    );
    if (progress?.completed) {
      return { completed: true, coinsEarned: 0 };
    }
    const currentProgress = progress?.progress || 0;
    if (currentProgress >= challenge.target) {
      await db.update(userChallengeProgress).set({
        completed: true,
        completedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(userChallengeProgress.userId, userId),
          eq(userChallengeProgress.challengeId, challengeId)
        )
      );
      await this.updateUserCoins(userId, challenge.reward);
      await this.recordTransaction(userId, "coin_earned", challenge.reward, challenge.reward, void 0, `Challenge completed: ${challenge.title}`);
      return { completed: true, coinsEarned: challenge.reward };
    }
    return { completed: false, progress: currentProgress };
  }
  // Forum Operations
  async createForumCategory(category) {
    const [newCategory] = await db.insert(forumCategories).values(category).returning();
    return newCategory;
  }
  async getForumCategories() {
    return await db.select().from(forumCategories).where(eq(forumCategories.isActive, true)).orderBy(forumCategories.name);
  }
  async createForumPost(post) {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    await db.update(forumCategories).set({
      postsCount: sql2`${forumCategories.postsCount} + 1`
    }).where(eq(forumCategories.id, post.categoryId));
    return newPost;
  }
  async getForumPosts(categoryId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];
    if (categoryId) {
      conditions.push(eq(forumPosts.categoryId, categoryId));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
    const [posts, [{ count: total }]] = await Promise.all([
      db.select().from(forumPosts).where(whereClause).orderBy(desc(forumPosts.isPinned), desc(forumPosts.lastReplyAt), desc(forumPosts.createdAt)).limit(limit).offset(offset),
      db.select({ count: count(forumPosts.id) }).from(forumPosts).where(whereClause)
    ]);
    return { posts, total: Number(total) };
  }
  async getForumPost(id) {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    return post;
  }
  async createForumReply(reply) {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    await db.update(forumPosts).set({
      repliesCount: sql2`${forumPosts.repliesCount} + 1`,
      lastReplyAt: /* @__PURE__ */ new Date(),
      lastReplyById: reply.authorId,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(forumPosts.id, reply.postId));
    return newReply;
  }
  async getForumReplies(postId) {
    return await db.select().from(forumReplies).where(eq(forumReplies.postId, postId)).orderBy(forumReplies.createdAt);
  }
  async toggleForumReplyLike(userId, replyId) {
    const [existingLike] = await db.select().from(forumReplyLikes).where(and(eq(forumReplyLikes.userId, userId), eq(forumReplyLikes.replyId, replyId)));
    if (existingLike) {
      await db.delete(forumReplyLikes).where(and(eq(forumReplyLikes.userId, userId), eq(forumReplyLikes.replyId, replyId)));
      await db.update(forumReplies).set({
        likesCount: sql2`${forumReplies.likesCount} - 1`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(forumReplies.id, replyId));
      return false;
    } else {
      await db.insert(forumReplyLikes).values({ userId, replyId });
      await db.update(forumReplies).set({
        likesCount: sql2`${forumReplies.likesCount} + 1`,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(forumReplies.id, replyId));
      return true;
    }
  }
  // Broadcast Operations
  async createBroadcast(broadcast) {
    const [newBroadcast] = await db.insert(broadcasts).values(broadcast).returning();
    return newBroadcast;
  }
  async getBroadcasts(target) {
    const conditions = [eq(broadcasts.isActive, true)];
    if (target) {
      conditions.push(or(eq(broadcasts.target, target), eq(broadcasts.target, "all_users")));
    }
    return await db.select().from(broadcasts).where(and(...conditions)).orderBy(desc(broadcasts.sentAt));
  }
  // Achievement Operations
  async createUserAchievement(achievement) {
    const [newAchievement] = await db.insert(userAchievements).values(achievement).returning();
    return newAchievement;
  }
  async getUserAchievements(userId) {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId)).orderBy(desc(userAchievements.unlockedAt));
  }
  // Educational Category Operations
  async getEducationalCategories() {
    const categories = await db.select().from(educationalCategories).where(eq(educationalCategories.isActive, true)).orderBy(educationalCategories.displayOrder, educationalCategories.name);
    if (categories.length === 0) {
      await this.seedEducationalCategories();
      return await db.select().from(educationalCategories).where(eq(educationalCategories.isActive, true)).orderBy(educationalCategories.displayOrder, educationalCategories.name);
    }
    return categories;
  }
  async saveUserEducationalPreferences(userId, categoryIds) {
    await db.delete(userEducationalPreferences).where(eq(userEducationalPreferences.userId, userId));
    if (categoryIds.length > 0) {
      const preferences = categoryIds.map((categoryId, index2) => ({
        userId,
        categoryId,
        isPrimary: index2 === 0
        // First category is primary
      }));
      await db.insert(userEducationalPreferences).values(preferences);
    }
  }
  async getUserEducationalPreferences(userId) {
    return await db.select({
      id: userEducationalPreferences.id,
      isPrimary: userEducationalPreferences.isPrimary,
      createdAt: userEducationalPreferences.createdAt,
      category: {
        id: educationalCategories.id,
        name: educationalCategories.name,
        description: educationalCategories.description,
        categoryType: educationalCategories.categoryType,
        icon: educationalCategories.icon,
        color: educationalCategories.color
      }
    }).from(userEducationalPreferences).innerJoin(
      educationalCategories,
      eq(userEducationalPreferences.categoryId, educationalCategories.id)
    ).where(eq(userEducationalPreferences.userId, userId)).orderBy(desc(userEducationalPreferences.isPrimary), educationalCategories.name);
  }
  async completeUserOnboarding(userId) {
    const [user] = await db.update(users).set({
      onboardingCompleted: true,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }
  async seedEducationalCategories() {
    const existingCounts = await db.select({ count: sql2`count(*)` }).from(educationalCategories).where(sql2`name IN ('Class 9th CBSE', 'JEE Main', 'UPSC CSE', 'Computer Science Engineering')`);
    if (existingCounts[0]?.count > 0) {
      console.log("Categories already seeded, skipping...");
      return;
    }
    console.log("Seeding educational categories...");
    const categoriesToSeed = [
      // School Categories - CBSE
      { name: "Class 9th CBSE", description: "Class 9 CBSE Board", categoryType: "school", classLevel: "9", board: "CBSE", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Geography", "History", "Economics"], isActive: true, displayOrder: 10, icon: "\u{1F4D4}", color: "#3B82F6" },
      { name: "Class 10th CBSE", description: "Class 10 CBSE Board with Board Exams", categoryType: "school", classLevel: "10", board: "CBSE", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Geography", "History", "Economics"], isActive: true, displayOrder: 13, icon: "\u{1F4D5}", color: "#3B82F6" },
      { name: "Class 11th CBSE Science", description: "Class 11 CBSE Science Stream (PCM/PCB)", categoryType: "school", classLevel: "11", board: "CBSE", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer_Science"], isActive: true, displayOrder: 16, icon: "\u{1F52C}", color: "#F59E0B" },
      { name: "Class 11th CBSE Commerce", description: "Class 11 CBSE Commerce Stream", categoryType: "school", classLevel: "11", board: "CBSE", subjects: ["Accountancy", "Business_Studies", "Economics", "English", "Mathematics"], isActive: true, displayOrder: 17, icon: "\u{1F4BC}", color: "#F59E0B" },
      { name: "Class 12th CBSE Science", description: "Class 12 CBSE Science Stream (PCM/PCB)", categoryType: "school", classLevel: "12", board: "CBSE", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer_Science"], isActive: true, displayOrder: 20, icon: "\u{1F393}", color: "#F59E0B" },
      { name: "Class 12th CBSE Commerce", description: "Class 12 CBSE Commerce Stream", categoryType: "school", classLevel: "12", board: "CBSE", subjects: ["Accountancy", "Business_Studies", "Economics", "English", "Mathematics"], isActive: true, displayOrder: 21, icon: "\u{1F4C8}", color: "#F59E0B" },
      // Competitive Exam Categories - Entrance Exams
      { name: "JEE Main", description: "Joint Entrance Examination - Main", categoryType: "competitive_exam", examType: "JEE_Main", subjects: ["Mathematics", "Physics", "Chemistry"], isActive: true, displayOrder: 30, icon: "\u2699\uFE0F", color: "#059669" },
      { name: "JEE Advanced", description: "Joint Entrance Examination - Advanced", categoryType: "competitive_exam", examType: "JEE_Advanced", subjects: ["Mathematics", "Physics", "Chemistry"], isActive: true, displayOrder: 31, icon: "\u{1F3AF}", color: "#059669" },
      { name: "NEET UG", description: "National Eligibility cum Entrance Test - Undergraduate", categoryType: "competitive_exam", examType: "NEET_UG", subjects: ["Physics", "Chemistry", "Biology"], isActive: true, displayOrder: 32, icon: "\u{1FA7A}", color: "#7C3AED" },
      { name: "CUET UG", description: "Common University Entrance Test - Undergraduate", categoryType: "competitive_exam", examType: "CUET_UG", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Political_Science", "Economics"], isActive: true, displayOrder: 33, icon: "\u{1F393}", color: "#7C3AED" },
      { name: "CUET PG", description: "Common University Entrance Test - Postgraduate", categoryType: "competitive_exam", examType: "CUET_PG", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Political_Science", "Economics"], isActive: true, displayOrder: 34, icon: "\u{1F4DA}", color: "#7C3AED" },
      // Professional Exam Categories - Government & Banking
      { name: "UPSC CSE", description: "Union Public Service Commission - Civil Services Examination", categoryType: "professional_exam", examType: "UPSC_CSE", subjects: ["General_Studies", "Optional_Subject", "Essay", "English", "Hindi"], isActive: true, displayOrder: 40, icon: "\u{1F3DB}\uFE0F", color: "#DC2626" },
      { name: "SSC CGL", description: "Staff Selection Commission - Combined Graduate Level", categoryType: "professional_exam", examType: "SSC_CGL", subjects: ["General_Intelligence", "General_Awareness", "Quantitative_Aptitude", "English"], isActive: true, displayOrder: 35, icon: "\u{1F4DD}", color: "#7C2D12" },
      { name: "SSC CHSL", description: "Staff Selection Commission - Combined Higher Secondary Level", categoryType: "professional_exam", examType: "SSC_CHSL", subjects: ["General_Intelligence", "General_Awareness", "Quantitative_Aptitude", "English"], isActive: true, displayOrder: 36, icon: "\u{1F4CA}", color: "#7C2D12" },
      { name: "SBI PO", description: "State Bank of India - Probationary Officer", categoryType: "professional_exam", examType: "SBI_PO", subjects: ["Reasoning", "Quantitative_Aptitude", "English", "General_Awareness", "Computer_Knowledge"], isActive: true, displayOrder: 45, icon: "\u{1F3E6}", color: "#1E40AF" },
      { name: "IBPS PO", description: "Institute of Banking Personnel Selection - Probationary Officer", categoryType: "professional_exam", examType: "IBPS_PO", subjects: ["Reasoning", "Quantitative_Aptitude", "English", "General_Awareness", "Computer_Knowledge"], isActive: true, displayOrder: 46, icon: "\u{1F4B3}", color: "#1E40AF" },
      { name: "RBI Grade B", description: "Reserve Bank of India - Grade B Officer", categoryType: "professional_exam", examType: "RBI_Grade_B", subjects: ["Reasoning", "Quantitative_Aptitude", "English", "General_Awareness", "Economics", "Finance"], isActive: true, displayOrder: 47, icon: "\u{1F3DB}\uFE0F", color: "#1E40AF" },
      // College Categories - Engineering Branches
      { name: "Computer Science Engineering", description: "Computer Science and Engineering Branch", categoryType: "college", engineeringBranch: "Computer_Science", subjects: ["Programming", "Data_Structures", "Algorithms", "Database_Systems", "Computer_Networks", "Software_Engineering"], isActive: true, displayOrder: 50, icon: "\u{1F4BB}", color: "#059669" },
      { name: "Electronics & Communication Engineering", description: "Electronics and Communication Engineering Branch", categoryType: "college", engineeringBranch: "Electronics_Communication", subjects: ["Circuit_Analysis", "Digital_Electronics", "Signal_Processing", "Communication_Systems", "Microprocessors", "VLSI_Design"], isActive: true, displayOrder: 51, icon: "\u{1F4E1}", color: "#059669" },
      { name: "Mechanical Engineering", description: "Mechanical Engineering Branch", categoryType: "college", engineeringBranch: "Mechanical", subjects: ["Thermodynamics", "Fluid_Mechanics", "Machine_Design", "Manufacturing_Processes", "Heat_Transfer", "Dynamics"], isActive: true, displayOrder: 52, icon: "\u2699\uFE0F", color: "#059669" },
      { name: "Civil Engineering", description: "Civil Engineering Branch", categoryType: "college", engineeringBranch: "Civil", subjects: ["Structural_Engineering", "Geotechnical_Engineering", "Transportation_Engineering", "Environmental_Engineering", "Fluid_Mechanics", "Construction_Management"], isActive: true, displayOrder: 53, icon: "\u{1F3D7}\uFE0F", color: "#059669" },
      // College Categories - Medical Specializations
      { name: "MBBS General Medicine", description: "Bachelor of Medicine and Bachelor of Surgery - General Medicine", categoryType: "college", medicalBranch: "General_Medicine", subjects: ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Internal_Medicine"], isActive: true, displayOrder: 60, icon: "\u{1FA7A}", color: "#7C3AED" },
      { name: "MBBS Surgery", description: "Bachelor of Medicine and Bachelor of Surgery - Surgery Specialization", categoryType: "college", medicalBranch: "Surgery", subjects: ["Anatomy", "Physiology", "General_Surgery", "Surgical_Procedures", "Anesthesia", "Critical_Care"], isActive: true, displayOrder: 61, icon: "\u{1F52C}", color: "#7C3AED" },
      { name: "MBBS Pediatrics", description: "Bachelor of Medicine and Bachelor of Surgery - Pediatrics Specialization", categoryType: "college", medicalBranch: "Pediatrics", subjects: ["Child_Development", "Pediatric_Medicine", "Neonatology", "Child_Psychology", "Vaccination", "Growth_Disorders"], isActive: true, displayOrder: 62, icon: "\u{1F476}", color: "#7C3AED" }
    ];
    await db.insert(educationalCategories).values(categoriesToSeed);
  }
  // Uploader/Wallet operations
  async getUploaderStats(topperId) {
    const [userStats] = await db.select({
      totalUploads: count(notes.id),
      publishedNotes: count(sql2`CASE WHEN ${notes.status} = 'published' THEN 1 END`),
      totalDownloads: sum(notes.downloadsCount),
      totalEarned: users.totalEarned
    }).from(notes).rightJoin(users, eq(users.id, topperId)).where(eq(notes.topperId, topperId)).groupBy(users.id, users.totalEarned);
    const walletBalance = Math.floor((userStats?.totalEarned || 0) / 20);
    return {
      totalUploads: userStats?.totalUploads || 0,
      publishedNotes: userStats?.publishedNotes || 0,
      totalDownloads: userStats?.totalDownloads || 0,
      walletBalance
    };
  }
  async getWithdrawalRequests(topperId) {
    return await db.select().from(withdrawalRequests).where(eq(withdrawalRequests.topperId, topperId)).orderBy(desc(withdrawalRequests.requestedAt));
  }
  async createWithdrawalRequest(request) {
    const [withdrawal] = await db.insert(withdrawalRequests).values(request).returning();
    return withdrawal;
  }
  // Admin withdrawal operations
  async getAllWithdrawalRequests() {
    return await db.select().from(withdrawalRequests).orderBy(desc(withdrawalRequests.requestedAt));
  }
  async approveWithdrawalRequest(id, adminId) {
    const [withdrawal] = await db.update(withdrawalRequests).set({
      status: "approved",
      processedAt: /* @__PURE__ */ new Date(),
      processedBy: adminId
    }).where(eq(withdrawalRequests.id, id)).returning();
    return withdrawal;
  }
  async rejectWithdrawalRequest(id, adminId, reason) {
    const [withdrawal] = await db.update(withdrawalRequests).set({
      status: "rejected",
      processedAt: /* @__PURE__ */ new Date(),
      processedBy: adminId,
      rejectionReason: reason
    }).where(eq(withdrawalRequests.id, id)).returning();
    return withdrawal;
  }
  async settleWithdrawalRequest(id, adminId, comments) {
    const [withdrawal] = await db.update(withdrawalRequests).set({
      status: "settled",
      processedAt: /* @__PURE__ */ new Date(),
      processedBy: adminId,
      adminComments: comments
    }).where(eq(withdrawalRequests.id, id)).returning();
    return withdrawal;
  }
  // User Activity Operations
  async getUserActivity() {
    const activities = [];
    const actions = ["login", "download", "upload", "view_note", "like_note", "follow_user", "comment"];
    const dbUsers = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email
    }).from(users).limit(5);
    for (let i = 0; i < 20; i++) {
      const user = dbUsers[Math.floor(Math.random() * dbUsers.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp2 = new Date(Date.now() - Math.random() * 36e5);
      activities.push({
        id: crypto.randomUUID(),
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        action,
        details: this.getActionDetails(action),
        timestamp: timestamp2.toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: "Mumbai, India"
      });
    }
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async getUserActivityById(userId) {
    const allActivities = await this.getUserActivity();
    return allActivities.filter((activity) => activity.userId === userId);
  }
  async recordUserActivity(userId, action, details) {
    console.log(`User ${userId} performed action: ${action}`, details);
  }
  async getUserStats(userId) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const userNotesStats = await db.select({
      notesCount: count(notes.id),
      totalViews: sum(notes.viewsCount),
      totalDownloads: sum(notes.downloadsCount),
      activeNotes: count(sql2`CASE WHEN ${notes.status} = 'published' THEN 1 END`),
      pendingReviews: count(sql2`CASE WHEN ${notes.status} = 'submitted' THEN 1 END`)
    }).from(notes).where(eq(notes.topperId, userId));
    const avgRatingResult = await db.select({
      avgRating: avg(feedback.rating)
    }).from(feedback).innerJoin(notes, eq(feedback.noteId, notes.id)).where(eq(notes.topperId, userId));
    const stats = userNotesStats[0];
    const avgRating = avgRatingResult[0]?.avgRating || 0;
    const monthlyEarnings = Math.floor((user?.totalEarned || 0) * 0.3);
    return {
      notesUploaded: Number(stats?.notesCount || 0),
      totalEarnings: user?.totalEarned || 0,
      totalDownloads: Number(stats?.totalDownloads || 0),
      averageRating: Number(avgRating),
      monthlyEarnings,
      totalViews: Number(stats?.totalViews || 0),
      activeNotes: Number(stats?.activeNotes || 0),
      pendingReviews: Number(stats?.pendingReviews || 0)
    };
  }
  async getUserSubjectStats(userId) {
    const subjectStats = await db.select({
      subject: notes.subject,
      notesCount: count(notes.id),
      downloads: sum(notes.downloadsCount),
      avgRating: avg(feedback.rating)
    }).from(notes).leftJoin(feedback, eq(feedback.noteId, notes.id)).where(eq(notes.topperId, userId)).groupBy(notes.subject);
    return subjectStats.map((stat) => ({
      subject: stat.subject,
      notesCount: Number(stat.notesCount || 0),
      earnings: Number(stat.downloads || 0) * 5,
      // Simulate earnings: 5 coins per download
      downloads: Number(stat.downloads || 0),
      averageRating: Number(stat.avgRating || 0)
    }));
  }
  async updateUserStats(userId, uploadData) {
    await db.update(users).set({
      totalEarned: sql2`${users.totalEarned} + 20`,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
    await db.insert(transactions).values({
      userId,
      type: "coin_earned",
      amount: 20,
      coinChange: 20,
      noteId: uploadData.noteId,
      description: `Earned 20 coins for uploading ${uploadData.subject} note`
    });
  }
  getActionDetails(action) {
    const detailsMap = {
      "login": { page: "/login", sessionDuration: "2h 15m" },
      "download": { noteTitle: "Physics Notes - Kinematics", noteId: crypto.randomUUID() },
      "upload": { noteTitle: "Chemistry Notes - Organic", noteId: crypto.randomUUID() },
      "view_note": { noteTitle: "Mathematics Notes - Calculus", noteId: crypto.randomUUID() },
      "like_note": { noteTitle: "Biology Notes - Cell Structure", noteId: crypto.randomUUID() },
      "follow_user": { followedUser: "Dr. Sarah Johnson", followedUserId: crypto.randomUUID() },
      "comment": { noteTitle: "History Notes - World War II", comment: "Great notes!" }
    };
    return detailsMap[action] || {};
  }
};
var storage = process.env.USE_SQLITE === "1" ? new InMemoryStorage() : new DatabaseStorage();

// server/replitAuth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";

// server/sendgrid.ts
import { MailService } from "@sendgrid/mail";
if (!process.env.SENDGRID_API_KEY && process.env.USE_SQLITE === "1") {
} else if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}
var mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}
async function sendEmail(params) {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith("SG.")) {
      console.warn("SendGrid API key not properly configured, skipping email");
      return true;
    }
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html
    });
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error);
    return false;
  }
}
async function sendWelcomeEmail(userEmail, userName) {
  const welcomeEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to MasterStudent!</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .features { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .feature { margin: 10px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">\u{1F393} MasterStudent</div>
          <h1>Welcome to Your Study Success Platform!</h1>
        </div>
        
        <div class="content">
          <p>Hi ${userName}!</p>
          
          <p>Welcome to <strong>MasterStudent</strong> - where top-performing students share their study notes and you can access premium educational content to boost your academic performance!</p>
          
          <div class="features">
            <h3>\u{1F680} What You Get:</h3>
            <div class="feature">\u{1F4DA} <strong>Premium Study Notes</strong> from top students across India</div>
            <div class="feature">\u{1F3AF} <strong>Comprehensive Coverage</strong> - Classes 9-12, JEE, NEET, CUET & more</div>
            <div class="feature">\u{1FA99} <strong>100 Free Coins</strong> to start downloading notes immediately</div>
            <div class="feature">\u26A1 <strong>3 Free Downloads</strong> daily to explore our content</div>
            <div class="feature">\u{1F4C8} <strong>Earn & Learn</strong> - Get coins for engagement and participation</div>
          </div>
          
          <p>Ready to accelerate your studies? Start browsing our extensive collection of high-quality notes!</p>
          
          <div style="text-align: center;">
            <a href="https://masterstudent.in" class="button">
              Start Learning Now \u2192
            </a>
          </div>
          
          <p><strong>Pro Tip:</strong> Complete your profile setup to discover notes perfectly matched to your curriculum and interests!</p>
        </div>
        
        <div class="footer">
          <p>Questions? Just reply to this email - we're here to help!</p>
          <p>Happy studying! \u{1F4D6}\u2728</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const welcomeEmailText = `
Welcome to MasterStudent, ${userName}!

You've joined India's premier platform where top-performing students share their study notes.

What You Get:
\u2022 Premium study notes from top students
\u2022 Coverage for Classes 9-12, JEE, NEET, CUET & more  
\u2022 100 free coins to start downloading
\u2022 3 free downloads daily
\u2022 Earn coins through engagement

Ready to boost your studies? Visit: https://masterstudent.in

Questions? Just reply to this email!
Happy studying!
`;
  return await sendEmail({
    to: userEmail,
    from: "welcome@masterstudent.com",
    // You should verify this domain in SendGrid
    subject: "\u{1F389} Welcome to MasterStudent - Your Study Success Starts Here!",
    text: welcomeEmailText,
    html: welcomeEmailHtml
  });
}

// server/replitAuth.ts
import crypto2 from "crypto";
function decodeGoogleJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    if (!payload.email || !payload.email_verified) {
      return null;
    }
    if (payload.exp * 1e3 < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
}
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  if (process.env.USE_SQLITE === "1") {
    return session({
      secret: process.env.SESSION_SECRET || "dev_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl
      }
    });
  }
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
async function createOrLoginUser(email, role, firstName, lastName) {
  let existingUser = await storage.getUserByEmail(email);
  if (!existingUser) {
    const newUser = await storage.upsertUser({
      id: crypto2.randomUUID(),
      email,
      firstName: firstName || email.split("@")[0],
      lastName: lastName || "",
      profileImageUrl: "",
      role: role === "topper" ? "topper" : "student"
      // Default to student if not specified
    });
    try {
      await sendWelcomeEmail(email, firstName || email.split("@")[0]);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
    }
    return newUser;
  }
  return existingUser;
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "email",
      // We'll use email as both username and password for simplicity
      passReqToCallback: true
      // Allow access to req object
    },
    async (req, email, password, done) => {
      try {
        if (!email || !email.includes("@")) {
          return done(null, false, { message: "Please enter a valid email address" });
        }
        const role = req.body?.role;
        const user = await createOrLoginUser(email, role);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  passport.deserializeUser(async (id, cb) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        cb(null, user);
      } else {
        cb(new Error("User not found"), null);
      }
    } catch (error) {
      console.error("Deserialization error:", error);
      cb(error, null);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(400).json({ message: info?.message || "Invalid email" });
      }
      req.logIn(user, (err2) => {
        if (err2) {
          return res.status(500).json({ message: "Login error" });
        }
        return res.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName } });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/google", async (req, res) => {
    try {
      const { credential, role } = req.body;
      if (!credential) {
        return res.status(400).json({ message: "Google credential is required" });
      }
      if (!role || role !== "student" && role !== "topper") {
        return res.status(400).json({ message: "Valid role is required" });
      }
      const payload = decodeGoogleJWT(credential);
      if (!payload) {
        return res.status(400).json({ message: "Invalid Google credential" });
      }
      const expectedClientId = "914859639485-t5pjjuir3bmauq2t51nb60v1l1gm4ud8.apps.googleusercontent.com";
      if (payload.aud !== expectedClientId) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      let user = await createOrLoginUser(
        payload.email,
        role,
        payload.given_name,
        payload.family_name
      );
      if (user.id) {
        const updatedUser = {
          ...user,
          profileImageUrl: payload.picture || user.profileImageUrl,
          // Mark as Google user for profile completion tracking
          authProvider: "google",
          emailVerified: payload.email_verified || false
        };
        await storage.upsertUser(updatedUser);
        user = updatedUser;
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Google login error:", err);
          return res.status(500).json({ message: "Login error" });
        }
        return res.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            role: user.role
          }
        });
      });
    } catch (error) {
      console.error("Google OAuth error:", error);
      return res.status(500).json({ message: "Authentication error" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ success: true });
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};

// server/admin-routes.ts
function registerAdminRoutes(app2) {
  const getUserId2 = (req) => req.user?.id || req.user?.claims?.sub;
  const requireAdmin = async (req, res, next) => {
    try {
      const userId = getUserId2(req);
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admins only" });
      }
      next();
    } catch (error) {
      console.error("Admin middleware error:", error);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
  const generateMockActivities = () => {
    const activities = [];
    const types = ["login", "logout", "upload", "download", "view", "registration", "subscription"];
    const users2 = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "David Brown"];
    const emails = ["john@example.com", "jane@example.com", "mike@example.com", "sarah@example.com", "david@example.com"];
    for (let i = 0; i < 20; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomUser = users2[Math.floor(Math.random() * users2.length)];
      const randomEmail = emails[Math.floor(Math.random() * emails.length)];
      activities.push({
        id: `activity-${i}`,
        type: randomType,
        description: `User ${randomType === "login" ? "logged in" : randomType === "logout" ? "logged out" : randomType === "upload" ? "uploaded a note" : randomType === "download" ? "downloaded a note" : randomType === "view" ? "viewed a note" : randomType === "registration" ? "registered" : "subscribed"}`,
        userName: randomUser,
        userEmail: randomEmail,
        timestamp: new Date(Date.now() - Math.random() * 864e5).toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
      });
    }
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  const generateMockUploadRequests = () => {
    const uploads = [];
    const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English"];
    const classes = ["9", "10", "11", "12"];
    const statuses = ["pending", "approved", "rejected", "processing"];
    const uploaders = ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson"];
    for (let i = 0; i < 15; i++) {
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomUploader = uploaders[Math.floor(Math.random() * uploaders.length)];
      uploads.push({
        id: `upload-${i}`,
        title: `${randomSubject} Notes - Chapter ${Math.floor(Math.random() * 10) + 1}`,
        subject: randomSubject,
        classGrade: randomClass,
        status: randomStatus,
        uploaderName: randomUploader,
        createdAt: new Date(Date.now() - Math.random() * 6048e5).toISOString(),
        fileCount: Math.floor(Math.random() * 5) + 1,
        totalSize: `${(Math.random() * 50).toFixed(1)} MB`,
        description: `Comprehensive notes covering key concepts in ${randomSubject} for Class ${randomClass}`
      });
    }
    return uploads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };
  const generateMockUserSessions = () => {
    const sessions2 = [];
    const users2 = ["Emma Thompson", "James Wilson", "Olivia Brown", "William Davis", "Sophia Miller"];
    const emails = ["emma@example.com", "james@example.com", "olivia@example.com", "william@example.com", "sophia@example.com"];
    const locations = ["Mumbai, India", "Delhi, India", "Bangalore, India", "Chennai, India", "Kolkata, India"];
    const devices = ["Chrome on Windows", "Safari on Mac", "Chrome on Android", "Firefox on Linux", "Edge on Windows"];
    for (let i = 0; i < 8; i++) {
      const randomUser = users2[Math.floor(Math.random() * users2.length)];
      const randomEmail = emails[Math.floor(Math.random() * emails.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      sessions2.push({
        id: `session-${i}`,
        userName: randomUser,
        userEmail: randomEmail,
        location: randomLocation,
        device: randomDevice,
        duration: `${Math.floor(Math.random() * 120) + 5} min`,
        lastActivity: new Date(Date.now() - Math.random() * 36e5).toISOString()
      });
    }
    return sessions2;
  };
  app2.get("/api/admin/activities", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const activities = generateMockActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  app2.get("/api/admin/upload-requests", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const uploads = generateMockUploadRequests();
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching upload requests:", error);
      res.status(500).json({ message: "Failed to fetch upload requests" });
    }
  });
  app2.get("/api/admin/user-sessions", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const sessions2 = generateMockUserSessions();
      res.json(sessions2);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });
  app2.get("/api/admin/stats", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = {
        totalUsers: 1247,
        totalNotes: 3456,
        activeSubscriptions: 234,
        pendingReviews: 12,
        totalDownloads: 15678,
        monthlyRevenue: 234 * 59,
        // activeSubscriptions * price
        platformRating: 4.8
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });
}

// server/routes.ts
import crypto3 from "crypto";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
function getUserId(req) {
  return req.user?.id || req.user?.sub || "";
}
var stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil"
  });
}
var upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024
    // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});
function registerRoutes(app2) {
  setupAuth(app2);
  registerAdminRoutes(app2);
  app2.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  const serverStartTime = Date.now();
  app2.use((req, res, next) => {
    if (req.method === "GET" && req.headers.accept?.includes("text/html")) {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    }
    if (req.path.startsWith("/api/")) {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    }
    next();
  });
  app2.get("/api/debug", (req, res) => {
    console.log("Debug endpoint hit!");
    res.json({
      message: "Debug endpoint working!",
      timestamp: Date.now(),
      method: req.method,
      path: req.path,
      url: req.url
    });
  });
  setupAuth(app2);
  app2.get("/api/version", (req, res) => {
    res.json({ version: serverStartTime, timestamp: Date.now() });
  });
  app2.get("/api/test", (req, res) => {
    res.json({ message: "API is working!", timestamp: Date.now() });
  });
  app2.get("/api/login", (req, res) => {
    res.redirect("/#/login");
  });
  app2.post("/api/create-admin", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      let user = await storage.getUserByEmail(email);
      if (user) {
        const updatedUser = await storage.upsertUser({
          ...user,
          role: "admin"
        });
        res.json({ success: true, message: "User updated to admin", user: updatedUser });
      } else {
        const newUser = await storage.upsertUser({
          id: crypto3.randomUUID(),
          email,
          firstName: firstName || "Admin",
          lastName: lastName || "User",
          profileImageUrl: "",
          role: "admin",
          onboardingCompleted: true
        });
        res.json({ success: true, message: "Admin user created", user: newUser });
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    console.log("Registration endpoint hit:", req.body);
    try {
      const { firstName, lastName, email, phone, password, selectedGoals } = req.body;
      if (!firstName || !lastName || !email || !password) {
        console.log("Validation failed - missing fields");
        return res.status(400).json({ message: "All fields are required" });
      }
      if (!email.includes("@")) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      const newUser = await storage.upsertUser({
        id: crypto3.randomUUID(),
        email,
        firstName,
        lastName,
        profileImageUrl: "",
        role: "student",
        onboardingCompleted: true
        // Mark as completed since they went through our flow
      });
      console.log("User created successfully:", newUser.id);
      req.logIn(newUser, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        console.log("User logged in successfully");
        sendWelcomeEmail(email, firstName).catch((emailError) => {
          console.error("Welcome email error:", emailError);
        });
        res.json({
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed: " + (error instanceof Error ? error.message : "Unknown error") });
    }
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let topperProfile = null;
      if (user.role === "topper") {
        topperProfile = await storage.getTopperProfile(user.id);
      }
      res.json({ ...user, topperProfile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post(
    "/api/create-subscription",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { plan } = req.body;
      try {
        if (!stripe) {
          return res.status(503).json({
            error: "Payment processing is currently unavailable. Stripe integration is not configured."
          });
        }
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        const existingSubscription = await storage.getActiveSubscription(userId);
        if (existingSubscription) {
          return res.json({
            message: "Already subscribed",
            subscription: existingSubscription
          });
        }
        let customer;
        if (user.stripeCustomerId) {
          customer = await stripe.customers.retrieve(user.stripeCustomerId);
        } else {
          customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim()
          });
          await storage.updateUserStripeInfo(userId, customer.id, "");
        }
        const priceId = plan === "yearly" ? process.env.STRIPE_YEARLY_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID;
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: priceId }],
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"]
        });
        const renewalDate = /* @__PURE__ */ new Date();
        if (plan === "yearly") {
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        } else {
          renewalDate.setMonth(renewalDate.getMonth() + 1);
        }
        await storage.createSubscription({
          studentId: userId,
          plan,
          startDate: /* @__PURE__ */ new Date(),
          renewalDate,
          status: "active",
          gateway: "stripe",
          gatewayCustomerId: customer.id,
          gatewaySubId: subscription.id
        });
        await storage.updateUserStripeInfo(
          userId,
          customer.id,
          subscription.id
        );
        res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
        });
      } catch (error) {
        console.error("Subscription error:", error);
        res.status(400).json({ error: error.message });
      }
    }
  );
  app2.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const subscription = await storage.getActiveSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });
  app2.get("/api/downloads", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const downloads2 = await storage.getDownloadHistory(userId);
      res.json({ downloads: downloads2 });
    } catch (error) {
      console.error("Error fetching downloads:", error);
      res.status(500).json({ message: "Failed to fetch downloads" });
    }
  });
  app2.get("/api/notes", async (req, res) => {
    try {
      const {
        subject,
        classGrade,
        search,
        categoryId,
        page = "1",
        limit = "20"
      } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const { notes: notes2, total } = await storage.getPublishedNotes({
        subject,
        classGrade,
        search,
        categoryId,
        limit: parseInt(limit),
        offset
      });
      res.json({
        notes: notes2,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });
  app2.get("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.getNoteById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      const feedbackList = await storage.getFeedbackByNote(note.id);
      res.json({ ...note, feedback: feedbackList });
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });
  app2.post(
    "/api/notes",
    isAuthenticated,
    upload.array("files"),
    async (req, res) => {
      const userId = getUserId(req);
      try {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const { title, subject, topic, classGrade, description, categoryId, chapter, unit } = req.body;
        const files = req.files;
        if (!files || files.length === 0) {
          return res.status(400).json({ message: "At least one file is required" });
        }
        const attachments = files.map((file) => {
          const organizedPath = `/uploads/${userId}/${subject}/${file.filename}`;
          const uploadDir = path.join(process.cwd(), "uploads", userId, subject);
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const oldPath = file.path;
          const newPath = path.join(process.cwd(), organizedPath.substring(1));
          try {
            fs.renameSync(oldPath, newPath);
          } catch (err) {
            console.error("Error moving file:", err);
            return `/uploads/${file.filename}`;
          }
          return organizedPath;
        });
        const note = await storage.createNote({
          title,
          subject,
          topic: chapter || unit || topic,
          // Use chapter/unit if provided, fallback to topic
          classGrade,
          description,
          attachments,
          topperId: userId,
          // All users can upload, but we keep this field for compatibility
          status: "submitted",
          // Submit directly for review
          categoryId: categoryId || null
        });
        await storage.updateUserCoins(userId, 20);
        await storage.recordTransaction(
          userId,
          "upload_reward",
          20,
          20,
          note.id,
          "Earned 20 coins for uploading notes"
        );
        await storage.createReviewTask({
          noteId: note.id,
          status: "open"
        });
        await storage.updateUserStats(userId, { subject, noteId: note.id });
        res.json({
          ...note,
          coinsEarned: 20,
          message: "Notes uploaded successfully! You earned 20 coins."
        });
      } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Failed to create note" });
      }
    }
  );
  app2.put("/api/notes/:id/submit", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const note = await storage.getNoteById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      if (note.topperId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const updatedNote = await storage.updateNoteStatus(
        req.params.id,
        "submitted"
      );
      await storage.createReviewTask({
        noteId: req.params.id,
        status: "open"
      });
      res.json(updatedNote);
    } catch (error) {
      console.error("Error submitting note:", error);
      res.status(500).json({ message: "Failed to submit note" });
    }
  });
  app2.post(
    "/api/notes/:id/download",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      try {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const subscription = await storage.getActiveSubscription(userId);
        if (!subscription) {
          return res.status(403).json({ message: "Active subscription required" });
        }
        const note = await storage.getNoteById(req.params.id);
        if (!note || note.status !== "published") {
          return res.status(404).json({ message: "Note not found" });
        }
        await storage.recordDownload(userId, req.params.id);
        res.json({
          message: "Download recorded",
          downloadUrl: note.attachments
        });
      } catch (error) {
        console.error("Error downloading note:", error);
        res.status(500).json({ message: "Failed to download note" });
      }
    }
  );
  app2.post(
    "/api/notes/:id/feedback",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { rating, comment } = req.body;
      try {
        const existingFeedback = await storage.getFeedbackByStudent(
          userId,
          req.params.id
        );
        if (existingFeedback) {
          return res.status(400).json({ message: "Feedback already provided" });
        }
        const feedback2 = await storage.createFeedback({
          noteId: req.params.id,
          studentId: userId,
          rating,
          comment
        });
        res.json(feedback2);
      } catch (error) {
        console.error("Error creating feedback:", error);
        res.status(500).json({ message: "Failed to create feedback" });
      }
    }
  );
  app2.get("/api/review/queue", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }
      const tasks = await storage.getReviewTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching review queue:", error);
      res.status(500).json({ message: "Failed to fetch review queue" });
    }
  });
  app2.put("/api/review/:id/approve", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }
      const task = await storage.updateReviewTask(req.params.id, {
        status: "approved",
        decidedAt: /* @__PURE__ */ new Date(),
        reviewerId: userId
      });
      const note = await storage.updateNoteStatus(
        task.noteId,
        "published",
        userId
      );
      res.json({ task, note });
    } catch (error) {
      console.error("Error approving note:", error);
      res.status(500).json({ message: "Failed to approve note" });
    }
  });
  app2.put("/api/review/:id/reject", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { comments } = req.body;
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admin only" });
      }
      const task = await storage.updateReviewTask(req.params.id, {
        status: "rejected",
        comments: comments || [],
        decidedAt: /* @__PURE__ */ new Date(),
        reviewerId: userId
      });
      const note = await storage.updateNoteStatus(
        task.noteId,
        "rejected",
        userId
      );
      res.json({ task, note });
    } catch (error) {
      console.error("Error rejecting note:", error);
      res.status(500).json({ message: "Failed to reject note" });
    }
  });
  app2.get("/api/uploader/stats", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "topper" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Toppers only" });
      }
      const stats = await storage.getUploaderStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching uploader stats:", error);
      res.status(500).json({ message: "Failed to fetch uploader stats" });
    }
  });
  app2.get("/api/withdrawals", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "topper" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Toppers only" });
      }
      const withdrawals = await storage.getWithdrawalRequests(userId);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });
  app2.post(
    "/api/withdrawals/request",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { amount, coins, bankDetails, upiId } = req.body;
      try {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "topper" && user.role !== "admin") {
          return res.status(403).json({ message: "Access denied - Toppers only" });
        }
        if (amount < 200) {
          return res.status(400).json({ message: "Minimum withdrawal amount is \u20B9200" });
        }
        const walletBalance = Math.floor(user.totalEarned / 20);
        if (amount > walletBalance) {
          return res.status(400).json({ message: "Insufficient wallet balance" });
        }
        const withdrawal = await storage.createWithdrawalRequest({
          topperId: userId,
          amount,
          coins,
          bankDetails,
          upiId,
          status: "pending"
        });
        res.json(withdrawal);
      } catch (error) {
        console.error("Error creating withdrawal request:", error);
        res.status(500).json({ message: "Failed to create withdrawal request" });
      }
    }
  );
  app2.get("/api/admin/withdrawals", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied - Admins only" });
      }
      const withdrawals = await storage.getAllWithdrawalRequests();
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching all withdrawal requests:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal requests" });
    }
  });
  app2.patch(
    "/api/admin/withdrawals/:id/approve",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { id } = req.params;
      try {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Access denied - Admins only" });
        }
        const withdrawal = await storage.approveWithdrawalRequest(id, userId);
        res.json(withdrawal);
      } catch (error) {
        console.error("Error approving withdrawal request:", error);
        res.status(500).json({ message: "Failed to approve withdrawal request" });
      }
    }
  );
  app2.patch(
    "/api/admin/withdrawals/:id/reject",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { id } = req.params;
      const { rejectionReason } = req.body;
      try {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Access denied - Admins only" });
        }
        const withdrawal = await storage.rejectWithdrawalRequest(
          id,
          userId,
          rejectionReason
        );
        res.json(withdrawal);
      } catch (error) {
        console.error("Error rejecting withdrawal request:", error);
        res.status(500).json({ message: "Failed to reject withdrawal request" });
      }
    }
  );
  app2.patch(
    "/api/admin/withdrawals/:id/settle",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { id } = req.params;
      const { settlementComments } = req.body;
      try {
        const user = await storage.getUser(userId);
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Access denied - Admins only" });
        }
        const withdrawal = await storage.settleWithdrawalRequest(
          id,
          userId,
          settlementComments
        );
        res.json(withdrawal);
      } catch (error) {
        console.error("Error settling withdrawal request:", error);
        res.status(500).json({ message: "Failed to settle withdrawal request" });
      }
    }
  );
  app2.get("/api/analytics/topper", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "topper") {
        return res.status(403).json({ message: "Access denied" });
      }
      const analytics = await storage.getTopperAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/admin/stats", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });
  app2.get("/api/admin/notes", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const { status, subject, page = "1", limit = "20" } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const { notes: notes2, total } = await storage.getAllNotesForAdmin({
        status,
        subject,
        limit: parseInt(limit),
        offset
      });
      res.json({
        notes: notes2,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error("Error fetching admin notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });
  app2.get("/api/admin/user-activity", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const activity = await storage.getUserActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });
  app2.get("/api/user/my-activity", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const activity = await storage.getUserActivityById(userId);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });
  app2.post("/api/follow/:topperId", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const follow = await storage.followTopper(userId, req.params.topperId);
      res.json(follow);
    } catch (error) {
      console.error("Error following topper:", error);
      res.status(500).json({ message: "Failed to follow topper" });
    }
  });
  app2.delete(
    "/api/follow/:topperId",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      try {
        await storage.unfollowTopper(userId, req.params.topperId);
        res.json({ message: "Unfollowed successfully" });
      } catch (error) {
        console.error("Error unfollowing topper:", error);
        res.status(500).json({ message: "Failed to unfollow topper" });
      }
    }
  );
  app2.get("/api/coins/balance", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        coinBalance: user.coinBalance,
        freeDownloadsLeft: user.freeDownloadsLeft,
        totalEarned: user.totalEarned,
        totalSpent: user.totalSpent,
        reputation: user.reputation,
        streak: user.streak
      });
    } catch (error) {
      console.error("Error fetching coin balance:", error);
      res.status(500).json({ message: "Failed to fetch coin balance" });
    }
  });
  app2.post(
    "/api/notes/:noteId/view",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { noteId } = req.params;
      try {
        const note = await storage.getNote(noteId);
        if (!note) {
          return res.status(404).json({ message: "Note not found" });
        }
        if (note.topperId === userId) {
          await storage.incrementNoteViews(noteId);
          return res.json({ coinsEarned: 0, message: "View recorded" });
        }
        const hasViewedToday = await storage.hasUserViewedNoteToday(
          userId,
          noteId
        );
        let coinsEarned = 0;
        if (!hasViewedToday) {
          coinsEarned = 1;
          await storage.recordNoteView(userId, noteId, coinsEarned);
          await storage.updateUserCoins(userId, coinsEarned);
          await storage.updateUserCoins(note.topperId, coinsEarned);
          await storage.recordTransaction(
            note.topperId,
            "coin_earned",
            coinsEarned,
            coinsEarned,
            noteId,
            "Earned from note view"
          );
        }
        await storage.incrementNoteViews(noteId);
        await storage.recordTransaction(
          userId,
          "coin_earned",
          coinsEarned,
          coinsEarned,
          noteId,
          "Earned from viewing note"
        );
        res.json({
          coinsEarned,
          message: coinsEarned > 0 ? "Coins earned!" : "View recorded"
        });
      } catch (error) {
        console.error("Error recording note view:", error);
        res.status(500).json({ message: "Failed to record view" });
      }
    }
  );
  app2.post(
    "/api/notes/:noteId/like",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { noteId } = req.params;
      try {
        const isLiked = await storage.toggleNoteLike(userId, noteId);
        const likesCount = await storage.getNoteLikesCount(noteId);
        res.json({ isLiked, likesCount });
      } catch (error) {
        console.error("Error toggling note like:", error);
        res.status(500).json({ message: "Failed to toggle like" });
      }
    }
  );
  app2.post(
    "/api/notes/:noteId/download",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { noteId } = req.params;
      try {
        const user = await storage.getUser(userId);
        const note = await storage.getNote(noteId);
        if (!user || !note) {
          return res.status(404).json({ message: "User or note not found" });
        }
        const hasDownloaded = await storage.hasUserDownloaded(userId, noteId);
        if (hasDownloaded) {
          return res.json({ message: "Already downloaded", downloaded: true });
        }
        let usedFreeDownload = false;
        let coinsSpent = 0;
        await storage.resetDailyFreeDownloads(userId);
        if (user.freeDownloadsLeft > 0) {
          usedFreeDownload = true;
          await storage.useFreeDowload(userId);
          await storage.recordTransaction(
            userId,
            "download_free",
            0,
            0,
            noteId,
            "Free download used"
          );
        } else if (user.coinBalance >= note.price) {
          coinsSpent = note.price;
          await storage.updateUserCoins(userId, -coinsSpent);
          await storage.recordTransaction(
            userId,
            "download_paid",
            coinsSpent,
            -coinsSpent,
            noteId,
            "Paid download with coins"
          );
          const creatorEarnings = Math.floor(coinsSpent * 0.5);
          await storage.updateUserCoins(note.topperId, creatorEarnings);
          await storage.recordTransaction(
            note.topperId,
            "coin_earned",
            creatorEarnings,
            creatorEarnings,
            noteId,
            "Earned from note download"
          );
        } else {
          return res.status(400).json({
            message: "Insufficient coins and no free downloads left",
            required: note.price,
            current: user.coinBalance
          });
        }
        await storage.recordDownload(userId, noteId);
        await storage.incrementNoteDownloads(noteId);
        res.json({
          message: "Download successful",
          usedFreeDownload,
          coinsSpent,
          downloaded: true
        });
      } catch (error) {
        console.error("Error downloading note:", error);
        res.status(500).json({ message: "Failed to download note" });
      }
    }
  );
  app2.get("/api/coins/packages", async (req, res) => {
    try {
      const packages = await storage.getCoinPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching coin packages:", error);
      res.status(500).json({ message: "Failed to fetch coin packages" });
    }
  });
  app2.get("/api/coins/transactions", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { page = 1, limit = 20 } = req.query;
    try {
      const transactions2 = await storage.getUserTransactions(
        userId,
        parseInt(page),
        parseInt(limit)
      );
      res.json(transactions2);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    const { type = "earnings", limit = 50 } = req.query;
    try {
      const leaderboard = await storage.getLeaderboard(
        type,
        parseInt(limit)
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/challenges/daily", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const challenges = await storage.getDailyChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching daily challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });
  app2.post(
    "/api/challenges/:challengeId/complete",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { challengeId } = req.params;
      try {
        const result = await storage.completeDailyChallenge(
          userId,
          challengeId
        );
        if (result.completed) {
          res.json({
            message: "Challenge completed!",
            coinsEarned: result.coinsEarned
          });
        } else {
          res.json({
            message: "Challenge not yet completed",
            progress: result.progress
          });
        }
      } catch (error) {
        console.error("Error completing challenge:", error);
        res.status(500).json({ message: "Failed to complete challenge" });
      }
    }
  );
  app2.get("/api/educational-categories", async (req, res) => {
    const categoryType = req.query.categoryType;
    try {
      const raw = await storage.getEducationalCategories();
      let categories = Array.isArray(raw) ? raw : [];
      if (categoryType) {
        categories = categories.filter(
          (cat) => cat.categoryType === categoryType
        );
      }
      if (categories.length === 0) {
        categories = [
          {
            id: "fallback-1",
            name: "Class 9th CBSE",
            description: "Class 9 CBSE Board",
            categoryType: "school",
            classLevel: "9",
            board: "CBSE",
            isActive: true,
            displayOrder: 10,
            icon: "\u{1F4D4}",
            color: "#3B82F6"
          },
          {
            id: "fallback-2",
            name: "Class 10th CBSE",
            description: "Class 10 CBSE Board with Board Exams",
            categoryType: "school",
            classLevel: "10",
            board: "CBSE",
            isActive: true,
            displayOrder: 13,
            icon: "\u{1F4D5}",
            color: "#3B82F6"
          },
          {
            id: "fallback-3",
            name: "Class 11th CBSE Science",
            description: "Class 11 CBSE Science Stream (PCM/PCB)",
            categoryType: "school",
            classLevel: "11",
            board: "CBSE",
            isActive: true,
            displayOrder: 16,
            icon: "\u{1F52C}",
            color: "#F59E0B"
          },
          {
            id: "fallback-4",
            name: "Class 12th CBSE Science",
            description: "Class 12 CBSE Science Stream (PCM/PCB)",
            categoryType: "school",
            classLevel: "12",
            board: "CBSE",
            isActive: true,
            displayOrder: 20,
            icon: "\u{1F393}",
            color: "#F59E0B"
          },
          {
            id: "fallback-5",
            name: "JEE Main",
            description: "Joint Entrance Examination - Main",
            categoryType: "competitive_exam",
            examType: "JEE_Main",
            isActive: true,
            displayOrder: 30,
            icon: "\u2699\uFE0F",
            color: "#059669"
          },
          {
            id: "fallback-6",
            name: "NEET UG",
            description: "National Eligibility cum Entrance Test - Undergraduate",
            categoryType: "competitive_exam",
            examType: "NEET_UG",
            isActive: true,
            displayOrder: 32,
            icon: "\u{1FA7A}",
            color: "#7C3AED"
          }
        ];
        if (categoryType) {
          categories = categories.filter(
            (cat) => cat.categoryType === categoryType
          );
        }
      }
      res.json(categories);
    } catch (error) {
      console.error("Error fetching educational categories:", error);
      const fallbackCategories = [
        {
          id: "emergency-1",
          name: "Class 10th CBSE",
          description: "Class 10 CBSE Board",
          categoryType: "school",
          isActive: true,
          displayOrder: 1,
          icon: "\u{1F4DA}",
          color: "#3B82F6"
        },
        {
          id: "emergency-2",
          name: "Class 12th CBSE",
          description: "Class 12 CBSE Board",
          categoryType: "school",
          isActive: true,
          displayOrder: 2,
          icon: "\u{1F393}",
          color: "#F59E0B"
        },
        {
          id: "emergency-3",
          name: "JEE Main",
          description: "Joint Entrance Examination",
          categoryType: "competitive_exam",
          isActive: true,
          displayOrder: 3,
          icon: "\u2699\uFE0F",
          color: "#059669"
        }
      ];
      if (categoryType) {
        return res.json(
          fallbackCategories.filter((cat) => cat.categoryType === categoryType)
        );
      }
      res.json(fallbackCategories);
    }
  });
  app2.post(
    "/api/complete-onboarding",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      const { categoryIds } = req.body;
      try {
        if (categoryIds && categoryIds.length > 0) {
          await storage.saveUserEducationalPreferences(userId, categoryIds);
        }
        await storage.completeUserOnboarding(userId);
        res.json({ message: "Onboarding completed successfully" });
      } catch (error) {
        console.error("Error completing onboarding:", error);
        res.status(500).json({ message: "Failed to complete onboarding" });
      }
    }
  );
  app2.get(
    "/api/user-educational-preferences",
    isAuthenticated,
    async (req, res) => {
      const userId = getUserId(req);
      try {
        const preferences = await storage.getUserEducationalPreferences(userId);
        res.json(preferences);
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        res.status(500).json({ message: "Failed to fetch preferences" });
      }
    }
  );
  app2.get("/api/user/stats", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  app2.get("/api/user/subject-stats", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    try {
      const subjectStats = await storage.getUserSubjectStats(userId);
      res.json(subjectStats);
    } catch (error) {
      console.error("Error fetching subject stats:", error);
      res.status(500).json({ message: "Failed to fetch subject stats" });
    }
  });
  app2.post("/api/user/stats/update", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { subject, noteId } = req.body;
    try {
      await storage.updateUserStats(userId, { subject, noteId });
      res.json({ message: "Stats updated successfully" });
    } catch (error) {
      console.error("Error updating user stats:", error);
      res.status(500).json({ message: "Failed to update user stats" });
    }
  });
  app2.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://masterstudent.in";
      const { notes: notes2 } = await storage.getPublishedNotes({
        limit: 1e3,
        offset: 0
      });
      const categories = await storage.getEducationalCategories();
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</lastmod>
  </url>
  <url>
    <loc>${baseUrl}/catalog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</lastmod>
  </url>`;
      categories?.forEach((category) => {
        const categorySlug = category.name.toLowerCase().replace(/\s+/g, "-");
        sitemap += `
  <url>
    <loc>${baseUrl}/category/${categorySlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
      notes2.forEach((note) => {
        const lastMod = note.updatedAt || note.createdAt || note.publishedAt;
        sitemap += `
  <url>
    <loc>${baseUrl}/notes/${note.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <lastmod>${new Date(lastMod).toISOString().split("T")[0]}</lastmod>
  </url>`;
      });
      sitemap += `
</urlset>`;
      res.set("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).json({ message: "Failed to generate sitemap" });
    }
  });
  app2.use("/uploads", (req, res, next) => {
    const filePath = path.join(__dirname, "..", "uploads", req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });
  registerAdminRoutes(app2);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/seed-data.ts
import crypto4 from "crypto";
var sampleNotes = [
  {
    title: "Quadratic Equations - Complete Guide",
    subject: "Mathematics",
    topic: "Algebra",
    description: "Comprehensive notes on quadratic equations covering all methods of solving, discriminant analysis, and real-world applications. Includes 50+ solved examples and practice problems.",
    tags: ["algebra", "equations", "mathematics", "class10", "cbse"],
    difficulty: "intermediate",
    estimatedTime: 45,
    price: 10,
    classGrade: "10"
  },
  {
    title: "Laws of Motion - Newton's Laws",
    subject: "Physics",
    topic: "Mechanics",
    description: "Detailed explanation of Newton's three laws of motion with practical examples, diagrams, and numerical problems. Perfect for JEE and NEET preparation.",
    tags: ["physics", "mechanics", "newton", "laws", "jee", "neet"],
    difficulty: "intermediate",
    estimatedTime: 60,
    price: 15,
    classGrade: "11"
  },
  {
    title: "Organic Chemistry - Hydrocarbons",
    subject: "Chemistry",
    topic: "Organic Chemistry",
    description: "Complete study material on hydrocarbons including alkanes, alkenes, and alkynes. Covers nomenclature, properties, reactions, and mechanisms.",
    tags: ["chemistry", "organic", "hydrocarbons", "jee", "neet"],
    difficulty: "advanced",
    estimatedTime: 90,
    price: 20,
    classGrade: "11"
  },
  {
    title: "Cell Structure and Function",
    subject: "Biology",
    topic: "Cell Biology",
    description: "Comprehensive notes on cell structure, organelles, and their functions. Includes detailed diagrams and comparison between plant and animal cells.",
    tags: ["biology", "cell", "structure", "organelles", "neet"],
    difficulty: "beginner",
    estimatedTime: 40,
    price: 8,
    classGrade: "9"
  },
  {
    title: "Data Structures - Arrays and Linked Lists",
    subject: "Computer_Science",
    topic: "Data Structures",
    description: "Fundamental concepts of arrays and linked lists with implementation in C++ and Python. Includes time complexity analysis and practice problems.",
    tags: ["programming", "data-structures", "arrays", "linked-lists", "cpp", "python"],
    difficulty: "intermediate",
    estimatedTime: 75,
    price: 25,
    classGrade: "12"
  },
  {
    title: "Trigonometry - Identities and Applications",
    subject: "Mathematics",
    topic: "Trigonometry",
    description: "Complete guide to trigonometric identities, equations, and their applications in real-world problems. Essential for competitive exams.",
    tags: ["mathematics", "trigonometry", "identities", "jee", "competitive"],
    difficulty: "advanced",
    estimatedTime: 80,
    price: 18,
    classGrade: "11"
  },
  {
    title: "Electromagnetic Induction",
    subject: "Physics",
    topic: "Electromagnetism",
    description: "Detailed study of Faraday's law, Lenz's law, and electromagnetic induction with practical applications and numerical problems.",
    tags: ["physics", "electromagnetism", "induction", "faraday", "jee"],
    difficulty: "advanced",
    estimatedTime: 70,
    price: 22,
    classGrade: "12"
  },
  {
    title: "Chemical Bonding and Molecular Structure",
    subject: "Chemistry",
    topic: "Chemical Bonding",
    description: "Comprehensive notes on ionic, covalent, and metallic bonding. Includes VSEPR theory, hybridization, and molecular orbital theory.",
    tags: ["chemistry", "bonding", "molecular", "vsepr", "hybridization"],
    difficulty: "intermediate",
    estimatedTime: 65,
    price: 16,
    classGrade: "11"
  },
  {
    title: "Photosynthesis and Respiration",
    subject: "Biology",
    topic: "Plant Physiology",
    description: "Detailed mechanism of photosynthesis and cellular respiration with biochemical pathways, enzymes, and energy calculations.",
    tags: ["biology", "photosynthesis", "respiration", "biochemistry", "neet"],
    difficulty: "advanced",
    estimatedTime: 85,
    price: 20,
    classGrade: "11"
  },
  {
    title: "Object-Oriented Programming Concepts",
    subject: "Computer_Science",
    topic: "Programming",
    description: "Fundamental OOP concepts including classes, objects, inheritance, polymorphism, and encapsulation with Java examples.",
    tags: ["programming", "oop", "java", "classes", "inheritance"],
    difficulty: "intermediate",
    estimatedTime: 90,
    price: 28,
    classGrade: "12"
  }
];
var sampleUsers = [
  {
    email: "rajesh.kumar@example.com",
    firstName: "Rajesh",
    lastName: "Kumar",
    role: "topper",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    coinBalance: 250,
    totalEarned: 1200,
    reputation: 95
  },
  {
    email: "priya.sharma@example.com",
    firstName: "Priya",
    lastName: "Sharma",
    role: "topper",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    coinBalance: 180,
    totalEarned: 800,
    reputation: 88
  },
  {
    email: "amit.singh@example.com",
    firstName: "Amit",
    lastName: "Singh",
    role: "topper",
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    coinBalance: 320,
    totalEarned: 1500,
    reputation: 92
  },
  {
    email: "student1@example.com",
    firstName: "Arjun",
    lastName: "Patel",
    role: "student",
    coinBalance: 50,
    totalSpent: 150
  },
  {
    email: "student2@example.com",
    firstName: "Sneha",
    lastName: "Gupta",
    role: "student",
    coinBalance: 75,
    totalSpent: 200
  }
];
async function seedDatabase() {
  try {
    console.log("\u{1F331} Starting database seeding...");
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await storage.upsertUser({
        id: crypto4.randomUUID(),
        ...userData,
        isActive: true,
        onboardingCompleted: true
      });
      createdUsers.push(user);
      console.log(`\u2705 Created user: ${user.firstName} ${user.lastName}`);
    }
    const toppers = createdUsers.filter((u) => u.role === "topper");
    const createdNotes = [];
    for (let i = 0; i < sampleNotes.length; i++) {
      const noteData = sampleNotes[i];
      const randomTopper = toppers[i % toppers.length];
      const note = await storage.createNote({
        ...noteData,
        topperId: randomTopper.id,
        status: "published",
        attachments: [`/uploads/sample-${i + 1}.pdf`],
        downloadsCount: Math.floor(Math.random() * 50) + 5,
        viewsCount: Math.floor(Math.random() * 200) + 20,
        likesCount: Math.floor(Math.random() * 30) + 2,
        categoryId: "fallback-1"
        // Use fallback category
      });
      createdNotes.push(note);
      console.log(`\u{1F4DD} Created note: ${note.title}`);
    }
    const students = createdUsers.filter((u) => u.role === "student");
    for (const student of students) {
      const downloadCount = Math.floor(Math.random() * 3) + 3;
      const shuffledNotes = [...createdNotes].sort(() => 0.5 - Math.random());
      for (let i = 0; i < downloadCount; i++) {
        const note = shuffledNotes[i];
        await storage.recordDownload(student.id, note.id);
        if (Math.random() < 0.7) {
          const rating = Math.floor(Math.random() * 2) + 4;
          const comments = [
            "Excellent notes! Very helpful for exam preparation.",
            "Clear explanations and good examples.",
            "Well structured content. Highly recommended!",
            "Perfect for quick revision before exams.",
            "Great quality notes with detailed explanations."
          ];
          await storage.createFeedback({
            noteId: note.id,
            studentId: student.id,
            rating,
            comment: comments[Math.floor(Math.random() * comments.length)]
          });
        }
      }
      console.log(`\u{1F4E5} Created downloads and feedback for: ${student.firstName}`);
    }
    for (const topper of toppers) {
      const userNotes = createdNotes.filter((n) => n.topperId === topper.id);
      let totalEarnings = 0;
      for (const note of userNotes) {
        const earnings = (note.downloadsCount || 0) * 5;
        totalEarnings += earnings;
        if (earnings > 0) {
          await storage.recordTransaction(
            topper.id,
            "coin_earned",
            earnings,
            earnings,
            note.id,
            `Earned ${earnings} coins from note downloads`
          );
        }
      }
      await storage.updateUserCoins(topper.id, totalEarnings - (topper.totalEarned || 0));
    }
    console.log("\u{1F389} Database seeding completed successfully!");
    console.log(`\u{1F4CA} Created: ${createdUsers.length} users, ${createdNotes.length} notes`);
  } catch (error) {
    console.error("\u274C Error seeding database:", error);
    throw error;
  }
}
async function checkAndSeedDatabase() {
  try {
    const { notes: notes2 } = await storage.getPublishedNotes({ limit: 1 });
    if (notes2.length === 0) {
      console.log("\u{1F4CB} No notes found, seeding database...");
      await seedDatabase();
    } else {
      console.log("\u2705 Database already has data, skipping seed");
    }
  } catch (error) {
    console.error("Error checking database:", error);
  }
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __filename = fileURLToPath(import.meta.url);
var __dirname2 = path2.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname2, "client", "src"),
      "@shared": path2.resolve(__dirname2, "shared"),
      "@assets": path2.resolve(__dirname2, "attached_assets")
    }
  },
  root: path2.resolve(__dirname2, "client"),
  build: {
    outDir: path2.resolve(__dirname2, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname3 = path3.dirname(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    return vite.middlewares(req, res, next);
  });
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      const clientTemplate = path3.resolve(
        __dirname3,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(__dirname3, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  await checkAndSeedDatabase();
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
