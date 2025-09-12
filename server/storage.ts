import {
  users,
  topperProfiles,
  notes,
  reviewTasks,
  feedback,
  subscriptions,
  transactions,
  payouts,
  follows,
  downloads,
  notifications,
  noteViews,
  noteLikes,
  forumCategories,
  forumPosts,
  forumReplies,
  forumReplyLikes,
  coinPackages,
  broadcasts,
  userAchievements,
  dailyChallenges,
  userChallengeProgress,
  educationalCategories,
  userEducationalPreferences,
  withdrawalRequests,
  type User,
  type UpsertUser,
  type TopperProfile,
  type InsertTopperProfile,
  type Note,
  type InsertNote,
  type ReviewTask,
  type InsertReviewTask,
  type Feedback,
  type InsertFeedback,
  type Subscription,
  type InsertSubscription,
  type Transaction,
  type Payout,
  type Follow,
  type Download,
  type Notification,
  type NoteView,
  type InsertNoteView,
  type NoteLike,
  type InsertNoteLike,
  type ForumCategory,
  type InsertForumCategory,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type ForumReplyLike,
  type CoinPackage,
  type InsertCoinPackage,
  type Broadcast,
  type InsertBroadcast,
  type UserAchievement,
  type InsertUserAchievement,
  type DailyChallenge,
  type InsertDailyChallenge,
  type UserChallengeProgress,
  type InsertUserChallengeProgress,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, count, avg, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // Topper profile operations
  createTopperProfile(profile: InsertTopperProfile): Promise<TopperProfile>;
  getTopperProfile(userId: string): Promise<TopperProfile | undefined>;
  updateTopperProfile(userId: string, updates: Partial<InsertTopperProfile>): Promise<TopperProfile>;
  
  // Note operations
  createNote(note: InsertNote): Promise<Note>;
  getNoteById(id: string): Promise<Note | undefined>;
  getNotesByTopper(topperId: string): Promise<Note[]>;
  getPublishedNotes(filters?: {
    subject?: string;
    classGrade?: string;
    search?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notes: Note[]; total: number }>;
  updateNote(id: string, updates: Partial<InsertNote>): Promise<Note>;
  updateNoteStatus(id: string, status: string, reviewerId?: string): Promise<Note>;
  
  // Review operations
  createReviewTask(task: InsertReviewTask): Promise<ReviewTask>;
  getReviewTasks(reviewerId?: string): Promise<ReviewTask[]>;
  updateReviewTask(id: string, updates: Partial<InsertReviewTask>): Promise<ReviewTask>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByNote(noteId: string): Promise<Feedback[]>;
  getFeedbackByStudent(studentId: string, noteId: string): Promise<Feedback | undefined>;
  
  // Subscription operations
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getActiveSubscription(studentId: string): Promise<Subscription | undefined>;
  updateSubscriptionStatus(id: string, status: string): Promise<Subscription>;
  
  // Follow operations
  followTopper(studentId: string, topperId: string): Promise<Follow>;
  unfollowTopper(studentId: string, topperId: string): Promise<void>;
  getFollows(studentId: string): Promise<Follow[]>;
  
  // Download operations
  recordDownload(studentId: string, noteId: string): Promise<Download>;
  getDownloadHistory(studentId: string): Promise<Download[]>;
  
  // Analytics
  getTopperAnalytics(topperId: string): Promise<{
    totalDownloads: number;
    averageRating: number;
    followersCount: number;
    notesCount: number;
  }>;
  
  // Admin operations
  getAdminStats(): Promise<{
    totalUsers: number;
    totalNotes: number;
    activeSubscriptions: number;
    pendingReviews: number;
  }>;

  // Coin System Operations
  getNote(id: string): Promise<Note | undefined>;
  updateUserCoins(userId: string, coinChange: number): Promise<void>;
  recordTransaction(userId: string, type: string, amount: number, coinChange: number, noteId?: string, description?: string): Promise<Transaction>;
  recordNoteView(viewerId: string, noteId: string, coinsEarned: number): Promise<NoteView>;
  hasUserViewedNoteToday(userId: string, noteId: string): Promise<boolean>;
  incrementNoteViews(noteId: string): Promise<void>;
  incrementNoteDownloads(noteId: string): Promise<void>;
  toggleNoteLike(userId: string, noteId: string): Promise<boolean>;
  getNoteLikesCount(noteId: string): Promise<number>;
  hasUserDownloaded(userId: string, noteId: string): Promise<boolean>;
  resetDailyFreeDownloads(userId: string): Promise<void>;
  useFreeDowload(userId: string): Promise<void>;
  getCoinPackages(): Promise<CoinPackage[]>;
  getUserTransactions(userId: string, page: number, limit: number): Promise<Transaction[]>;
  getLeaderboard(type: string, limit: number): Promise<any[]>;
  getDailyChallenges(userId: string): Promise<any[]>;
  completeDailyChallenge(userId: string, challengeId: string): Promise<{ completed: boolean; coinsEarned?: number; progress?: number }>;

  // Forum Operations
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  getForumCategories(): Promise<ForumCategory[]>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumPosts(categoryId?: string, page?: number, limit?: number): Promise<{ posts: ForumPost[]; total: number }>;
  getForumPost(id: string): Promise<ForumPost | undefined>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  getForumReplies(postId: string): Promise<ForumReply[]>;
  toggleForumReplyLike(userId: string, replyId: string): Promise<boolean>;

  // Broadcast Operations
  createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast>;
  getBroadcasts(target?: string): Promise<Broadcast[]>;

  // Achievement Operations
  createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;

  // Educational Category Operations
  getEducationalCategories(): Promise<any[]>;
  saveUserEducationalPreferences(userId: string, categoryIds: string[]): Promise<void>;
  getUserEducationalPreferences(userId: string): Promise<any[]>;
  completeUserOnboarding(userId: string): Promise<User>;
  seedEducationalCategories(): Promise<void>;
  
  // Uploader/Wallet operations
  getUploaderStats(topperId: string): Promise<any>;
  getWithdrawalRequests(topperId: string): Promise<WithdrawalRequest[]>;
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  
  // Admin withdrawal operations
  getAllWithdrawalRequests(): Promise<WithdrawalRequest[]>;
  approveWithdrawalRequest(id: string, adminId: string): Promise<WithdrawalRequest>;
  rejectWithdrawalRequest(id: string, adminId: string, reason: string): Promise<WithdrawalRequest>;
  settleWithdrawalRequest(id: string, adminId: string, comments?: string): Promise<WithdrawalRequest>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User management
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId, 
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Topper profile operations
  async createTopperProfile(profile: InsertTopperProfile): Promise<TopperProfile> {
    const [topperProfile] = await db
      .insert(topperProfiles)
      .values(profile)
      .returning();
    return topperProfile;
  }

  async getTopperProfile(userId: string): Promise<TopperProfile | undefined> {
    const [profile] = await db
      .select()
      .from(topperProfiles)
      .where(eq(topperProfiles.userId, userId));
    return profile;
  }

  async updateTopperProfile(userId: string, updates: Partial<InsertTopperProfile>): Promise<TopperProfile> {
    const [profile] = await db
      .update(topperProfiles)
      .set(updates)
      .where(eq(topperProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Note operations
  async createNote(note: InsertNote): Promise<Note> {
    const [createdNote] = await db
      .insert(notes)
      .values(note)
      .returning();
    return createdNote;
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async getNotesByTopper(topperId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.topperId, topperId))
      .orderBy(desc(notes.createdAt));
  }

  async getPublishedNotes(filters?: {
    subject?: string;
    classGrade?: string;
    search?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notes: Note[]; total: number }> {
    const conditions = [eq(notes.status, 'published')];
    
    if (filters?.subject) {
      conditions.push(eq(notes.subject, filters.subject as any));
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
        )!
      );
    }

    const [notesResult, totalResult] = await Promise.all([
      db
        .select({
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
        })
        .from(notes)
        .where(and(...conditions))
        .orderBy(desc(notes.publishedAt))
        .limit(filters?.limit || 20)
        .offset(filters?.offset || 0),
      db
        .select({ count: count() })
        .from(notes)
        .where(and(...conditions))
    ]);

    return {
      notes: notesResult as Note[],
      total: totalResult[0].count
    };
  }

  async updateNote(id: string, updates: Partial<InsertNote>): Promise<Note> {
    const [note] = await db
      .update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return note;
  }

  async updateNoteStatus(id: string, status: string, reviewerId?: string): Promise<Note> {
    const updateData: any = { 
      status: status as any, 
      updatedAt: new Date() 
    };
    
    if (reviewerId) {
      updateData.reviewerId = reviewerId;
    }
    
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const [note] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning();
    return note;
  }

  // Review operations
  async createReviewTask(task: InsertReviewTask): Promise<ReviewTask> {
    const [reviewTask] = await db
      .insert(reviewTasks)
      .values(task)
      .returning();
    return reviewTask;
  }

  async getReviewTasks(reviewerId?: string): Promise<ReviewTask[]> {
    const conditions = [];
    
    if (reviewerId) {
      conditions.push(eq(reviewTasks.reviewerId, reviewerId));
    }

    return await db
      .select()
      .from(reviewTasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(reviewTasks.createdAt));
  }

  async updateReviewTask(id: string, updates: Partial<InsertReviewTask>): Promise<ReviewTask> {
    const [task] = await db
      .update(reviewTasks)
      .set(updates)
      .where(eq(reviewTasks.id, id))
      .returning();
    return task;
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [feedbackRecord] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return feedbackRecord;
  }

  async getFeedbackByNote(noteId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.noteId, noteId))
      .orderBy(desc(feedback.createdAt));
  }

  async getFeedbackByStudent(studentId: string, noteId: string): Promise<Feedback | undefined> {
    const [feedbackRecord] = await db
      .select()
      .from(feedback)
      .where(and(eq(feedback.studentId, studentId), eq(feedback.noteId, noteId)));
    return feedbackRecord;
  }

  // Subscription operations
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [sub] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return sub;
  }

  async getActiveSubscription(studentId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.studentId, studentId), eq(subscriptions.status, 'active')))
      .orderBy(desc(subscriptions.createdAt));
    return subscription;
  }

  async updateSubscriptionStatus(id: string, status: string): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ status: status as any })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  // Follow operations
  async followTopper(studentId: string, topperId: string): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ studentId, topperId })
      .returning();
    return follow;
  }

  async unfollowTopper(studentId: string, topperId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(eq(follows.studentId, studentId), eq(follows.topperId, topperId)));
  }

  async getFollows(studentId: string): Promise<Follow[]> {
    return await db
      .select()
      .from(follows)
      .where(eq(follows.studentId, studentId));
  }

  // Download operations
  async recordDownload(studentId: string, noteId: string): Promise<Download> {
    const [download] = await db
      .insert(downloads)
      .values({ studentId, noteId })
      .returning();
    
    // Increment download count
    await db
      .update(notes)
      .set({ 
        downloadsCount: sql`${notes.downloadsCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(notes.id, noteId));
    
    return download;
  }

  async getDownloadHistory(studentId: string): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .where(eq(downloads.studentId, studentId))
      .orderBy(desc(downloads.downloadedAt));
  }

  // Analytics
  async getTopperAnalytics(topperId: string): Promise<{
    totalDownloads: number;
    averageRating: number;
    followersCount: number;
    notesCount: number;
  }> {
    const [downloadStats] = await db
      .select({
        totalDownloads: sum(notes.downloadsCount),
        notesCount: count(notes.id)
      })
      .from(notes)
      .where(eq(notes.topperId, topperId));

    const [ratingStats] = await db
      .select({
        averageRating: avg(feedback.rating)
      })
      .from(feedback)
      .innerJoin(notes, eq(notes.id, feedback.noteId))
      .where(eq(notes.topperId, topperId));

    const [followersStats] = await db
      .select({
        followersCount: count(follows.id)
      })
      .from(follows)
      .where(eq(follows.topperId, topperId));

    return {
      totalDownloads: Number(downloadStats.totalDownloads) || 0,
      averageRating: Number(ratingStats.averageRating) || 0,
      followersCount: Number(followersStats.followersCount) || 0,
      notesCount: Number(downloadStats.notesCount) || 0,
    };
  }

  // Admin operations
  async getAdminStats(): Promise<{
    totalUsers: number;
    totalNotes: number;
    activeSubscriptions: number;
    pendingReviews: number;
  }> {
    const [userStats] = await db
      .select({ totalUsers: count(users.id) })
      .from(users);

    const [noteStats] = await db
      .select({ totalNotes: count(notes.id) })
      .from(notes);

    const [subscriptionStats] = await db
      .select({ activeSubscriptions: count(subscriptions.id) })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));

    const [reviewStats] = await db
      .select({ pendingReviews: count(reviewTasks.id) })
      .from(reviewTasks)
      .where(eq(reviewTasks.status, 'open'));

    return {
      totalUsers: Number(userStats.totalUsers) || 0,
      totalNotes: Number(noteStats.totalNotes) || 0,
      activeSubscriptions: Number(subscriptionStats.activeSubscriptions) || 0,
      pendingReviews: Number(reviewStats.pendingReviews) || 0,
    };
  }

  // Coin System Implementations
  async getNote(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async updateUserCoins(userId: string, coinChange: number): Promise<void> {
    await db
      .update(users)
      .set({
        coinBalance: sql`${users.coinBalance} + ${coinChange}`,
        totalEarned: coinChange > 0 ? sql`${users.totalEarned} + ${coinChange}` : users.totalEarned,
        totalSpent: coinChange < 0 ? sql`${users.totalSpent} + ${Math.abs(coinChange)}` : users.totalSpent,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async recordTransaction(userId: string, type: string, amount: number, coinChange: number, noteId?: string, description?: string): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        userId,
        type: type as any,
        amount,
        coinChange,
        noteId,
        description,
      })
      .returning();
    return transaction;
  }

  async recordNoteView(viewerId: string, noteId: string, coinsEarned: number): Promise<NoteView> {
    const [view] = await db
      .insert(noteViews)
      .values({
        noteId,
        viewerId,
        coinsEarned,
      })
      .returning();
    return view;
  }

  async hasUserViewedNoteToday(userId: string, noteId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [view] = await db
      .select()
      .from(noteViews)
      .where(
        and(
          eq(noteViews.viewerId, userId),
          eq(noteViews.noteId, noteId),
          sql`${noteViews.viewedAt} >= ${today}`
        )
      );
    
    return !!view;
  }

  async incrementNoteViews(noteId: string): Promise<void> {
    await db
      .update(notes)
      .set({
        viewsCount: sql`${notes.viewsCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, noteId));
  }

  async incrementNoteDownloads(noteId: string): Promise<void> {
    await db
      .update(notes)
      .set({
        downloadsCount: sql`${notes.downloadsCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, noteId));
  }

  async toggleNoteLike(userId: string, noteId: string): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(noteLikes)
      .where(and(eq(noteLikes.userId, userId), eq(noteLikes.noteId, noteId)));

    if (existingLike) {
      // Remove like
      await db
        .delete(noteLikes)
        .where(and(eq(noteLikes.userId, userId), eq(noteLikes.noteId, noteId)));
      
      await db
        .update(notes)
        .set({
          likesCount: sql`${notes.likesCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(notes.id, noteId));
      
      return false;
    } else {
      // Add like
      await db.insert(noteLikes).values({ userId, noteId });
      
      await db
        .update(notes)
        .set({
          likesCount: sql`${notes.likesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(notes.id, noteId));
      
      return true;
    }
  }

  async getNoteLikesCount(noteId: string): Promise<number> {
    const [result] = await db
      .select({ count: count(noteLikes.id) })
      .from(noteLikes)
      .where(eq(noteLikes.noteId, noteId));
    return Number(result.count) || 0;
  }

  async hasUserDownloaded(userId: string, noteId: string): Promise<boolean> {
    const [download] = await db
      .select()
      .from(downloads)
      .where(and(eq(downloads.studentId, userId), eq(downloads.noteId, noteId)));
    return !!download;
  }

  async resetDailyFreeDownloads(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const lastReset = user.lastFreeDownloadReset;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastReset || new Date(lastReset) < today) {
      await db
        .update(users)
        .set({
          freeDownloadsLeft: 3,
          lastFreeDownloadReset: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }
  }

  async useFreeDowload(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        freeDownloadsLeft: sql`${users.freeDownloadsLeft} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getCoinPackages(): Promise<CoinPackage[]> {
    return await db
      .select()
      .from(coinPackages)
      .where(eq(coinPackages.isActive, true))
      .orderBy(coinPackages.price);
  }

  async getUserTransactions(userId: string, page: number, limit: number): Promise<Transaction[]> {
    const offset = (page - 1) * limit;
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getLeaderboard(type: string, limit: number): Promise<any[]> {
    if (type === 'earnings') {
      return await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          totalEarned: users.totalEarned,
          reputation: users.reputation,
        })
        .from(users)
        .where(eq(users.isActive, true))
        .orderBy(desc(users.totalEarned))
        .limit(limit);
    } else if (type === 'reputation') {
      return await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          reputation: users.reputation,
          totalEarned: users.totalEarned,
        })
        .from(users)
        .where(eq(users.isActive, true))
        .orderBy(desc(users.reputation))
        .limit(limit);
    }
    return [];
  }

  async getDailyChallenges(userId: string): Promise<any[]> {
    const activeChallenges = await db
      .select()
      .from(dailyChallenges)
      .where(
        and(
          eq(dailyChallenges.isActive, true),
          sql`${dailyChallenges.validUntil} > NOW()`
        )
      );

    const challengesWithProgress = await Promise.all(
      activeChallenges.map(async (challenge) => {
        const [progress] = await db
          .select()
          .from(userChallengeProgress)
          .where(
            and(
              eq(userChallengeProgress.userId, userId),
              eq(userChallengeProgress.challengeId, challenge.id)
            )
          );

        return {
          ...challenge,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
        };
      })
    );

    return challengesWithProgress;
  }

  async completeDailyChallenge(userId: string, challengeId: string): Promise<{ completed: boolean; coinsEarned?: number; progress?: number }> {
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId));

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const [progress] = await db
      .select()
      .from(userChallengeProgress)
      .where(
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
      // Complete the challenge
      await db
        .update(userChallengeProgress)
        .set({
          completed: true,
          completedAt: new Date(),
        })
        .where(
          and(
            eq(userChallengeProgress.userId, userId),
            eq(userChallengeProgress.challengeId, challengeId)
          )
        );

      // Award coins
      await this.updateUserCoins(userId, challenge.reward);
      await this.recordTransaction(userId, 'coin_earned', challenge.reward, challenge.reward, undefined, `Challenge completed: ${challenge.title}`);

      return { completed: true, coinsEarned: challenge.reward };
    }

    return { completed: false, progress: currentProgress };
  }

  // Forum Operations
  async createForumCategory(category: InsertForumCategory): Promise<ForumCategory> {
    const [newCategory] = await db.insert(forumCategories).values(category).returning();
    return newCategory;
  }

  async getForumCategories(): Promise<ForumCategory[]> {
    return await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.isActive, true))
      .orderBy(forumCategories.name);
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    
    // Increment posts count for category
    await db
      .update(forumCategories)
      .set({
        postsCount: sql`${forumCategories.postsCount} + 1`,
      })
      .where(eq(forumCategories.id, post.categoryId));

    return newPost;
  }

  async getForumPosts(categoryId?: string, page = 1, limit = 20): Promise<{ posts: ForumPost[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const conditions = [];
    if (categoryId) {
      conditions.push(eq(forumPosts.categoryId, categoryId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [posts, [{ count: total }]] = await Promise.all([
      db
        .select()
        .from(forumPosts)
        .where(whereClause)
        .orderBy(desc(forumPosts.isPinned), desc(forumPosts.lastReplyAt), desc(forumPosts.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count(forumPosts.id) })
        .from(forumPosts)
        .where(whereClause)
    ]);

    return { posts, total: Number(total) };
  }

  async getForumPost(id: string): Promise<ForumPost | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    return post;
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    
    // Update post reply count and last reply info
    await db
      .update(forumPosts)
      .set({
        repliesCount: sql`${forumPosts.repliesCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyById: reply.authorId,
        updatedAt: new Date(),
      })
      .where(eq(forumPosts.id, reply.postId));

    return newReply;
  }

  async getForumReplies(postId: string): Promise<ForumReply[]> {
    return await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.postId, postId))
      .orderBy(forumReplies.createdAt);
  }

  async toggleForumReplyLike(userId: string, replyId: string): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(forumReplyLikes)
      .where(and(eq(forumReplyLikes.userId, userId), eq(forumReplyLikes.replyId, replyId)));

    if (existingLike) {
      await db
        .delete(forumReplyLikes)
        .where(and(eq(forumReplyLikes.userId, userId), eq(forumReplyLikes.replyId, replyId)));
      
      await db
        .update(forumReplies)
        .set({
          likesCount: sql`${forumReplies.likesCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(forumReplies.id, replyId));
      
      return false;
    } else {
      await db.insert(forumReplyLikes).values({ userId, replyId });
      
      await db
        .update(forumReplies)
        .set({
          likesCount: sql`${forumReplies.likesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(forumReplies.id, replyId));
      
      return true;
    }
  }

  // Broadcast Operations
  async createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast> {
    const [newBroadcast] = await db.insert(broadcasts).values(broadcast).returning();
    return newBroadcast;
  }

  async getBroadcasts(target?: string): Promise<Broadcast[]> {
    const conditions = [eq(broadcasts.isActive, true)];
    
    if (target) {
      conditions.push(or(eq(broadcasts.target, target as any), eq(broadcasts.target, 'all_users'))!);
    }

    return await db
      .select()
      .from(broadcasts)
      .where(and(...conditions))
      .orderBy(desc(broadcasts.sentAt));
  }

  // Achievement Operations
  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newAchievement] = await db.insert(userAchievements).values(achievement).returning();
    return newAchievement;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  // Educational Category Operations
  async getEducationalCategories(): Promise<any[]> {
    const categories = await db
      .select()
      .from(educationalCategories)
      .where(eq(educationalCategories.isActive, true))
      .orderBy(educationalCategories.displayOrder, educationalCategories.name);
    
    // Auto-seed if no categories exist
    if (categories.length === 0) {
      await this.seedEducationalCategories();
      // Fetch categories again after seeding
      return await db
        .select()
        .from(educationalCategories)
        .where(eq(educationalCategories.isActive, true))
        .orderBy(educationalCategories.displayOrder, educationalCategories.name);
    }
    
    return categories;
  }

  async saveUserEducationalPreferences(userId: string, categoryIds: string[]): Promise<void> {
    // First, remove existing preferences for this user
    await db
      .delete(userEducationalPreferences)
      .where(eq(userEducationalPreferences.userId, userId));

    // Then insert new preferences
    if (categoryIds.length > 0) {
      const preferences = categoryIds.map((categoryId, index) => ({
        userId,
        categoryId,
        isPrimary: index === 0, // First category is primary
      }));
      
      await db.insert(userEducationalPreferences).values(preferences);
    }
  }

  async getUserEducationalPreferences(userId: string): Promise<any[]> {
    return await db
      .select({
        id: userEducationalPreferences.id,
        isPrimary: userEducationalPreferences.isPrimary,
        createdAt: userEducationalPreferences.createdAt,
        category: {
          id: educationalCategories.id,
          name: educationalCategories.name,
          description: educationalCategories.description,
          categoryType: educationalCategories.categoryType,
          icon: educationalCategories.icon,
          color: educationalCategories.color,
        }
      })
      .from(userEducationalPreferences)
      .innerJoin(
        educationalCategories,
        eq(userEducationalPreferences.categoryId, educationalCategories.id)
      )
      .where(eq(userEducationalPreferences.userId, userId))
      .orderBy(desc(userEducationalPreferences.isPrimary), educationalCategories.name);
  }

  async completeUserOnboarding(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        onboardingCompleted: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async seedEducationalCategories(): Promise<void> {
    // Check if categories already exist
    const existingCategories = await db.select().from(educationalCategories).limit(1);
    if (existingCategories.length > 0) {
      return; // Categories already seeded
    }

    const categoriesToSeed = [
      // School Categories - CBSE
      { name: "Class 9th CBSE", description: "Class 9 CBSE Board", categoryType: "school", classLevel: "9", board: "CBSE", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Geography", "History", "Economics"], isActive: true, displayOrder: 10, icon: "📔", color: "#3B82F6" },
      { name: "Class 10th CBSE", description: "Class 10 CBSE Board with Board Exams", categoryType: "school", classLevel: "10", board: "CBSE", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Geography", "History", "Economics"], isActive: true, displayOrder: 13, icon: "📕", color: "#3B82F6" },
      { name: "Class 11th CBSE Science", description: "Class 11 CBSE Science Stream (PCM/PCB)", categoryType: "school", classLevel: "11", board: "CBSE", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer_Science"], isActive: true, displayOrder: 16, icon: "🔬", color: "#F59E0B" },
      { name: "Class 11th CBSE Commerce", description: "Class 11 CBSE Commerce Stream", categoryType: "school", classLevel: "11", board: "CBSE", subjects: ["Accountancy", "Business_Studies", "Economics", "English", "Mathematics"], isActive: true, displayOrder: 17, icon: "💼", color: "#F59E0B" },
      { name: "Class 12th CBSE Science", description: "Class 12 CBSE Science Stream (PCM/PCB)", categoryType: "school", classLevel: "12", board: "CBSE", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer_Science"], isActive: true, displayOrder: 20, icon: "🎓", color: "#F59E0B" },
      { name: "Class 12th CBSE Commerce", description: "Class 12 CBSE Commerce Stream", categoryType: "school", classLevel: "12", board: "CBSE", subjects: ["Accountancy", "Business_Studies", "Economics", "English", "Mathematics"], isActive: true, displayOrder: 21, icon: "📈", color: "#F59E0B" },

      // Competitive Exam Categories - Entrance Exams
      { name: "JEE Main", description: "Joint Entrance Examination - Main", categoryType: "competitive_exam", examType: "JEE_Main", subjects: ["Mathematics", "Physics", "Chemistry"], isActive: true, displayOrder: 30, icon: "⚙️", color: "#059669" },
      { name: "JEE Advanced", description: "Joint Entrance Examination - Advanced", categoryType: "competitive_exam", examType: "JEE_Advanced", subjects: ["Mathematics", "Physics", "Chemistry"], isActive: true, displayOrder: 31, icon: "🎯", color: "#059669" },
      { name: "NEET UG", description: "National Eligibility cum Entrance Test - Undergraduate", categoryType: "competitive_exam", examType: "NEET_UG", subjects: ["Physics", "Chemistry", "Biology"], isActive: true, displayOrder: 32, icon: "🩺", color: "#7C3AED" },
      { name: "CUET UG", description: "Common University Entrance Test - Undergraduate", categoryType: "competitive_exam", examType: "CUET_UG", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Political_Science", "Economics"], isActive: true, displayOrder: 33, icon: "🎓", color: "#7C3AED" },
      { name: "CUET PG", description: "Common University Entrance Test - Postgraduate", categoryType: "competitive_exam", examType: "CUET_PG", subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Political_Science", "Economics"], isActive: true, displayOrder: 34, icon: "📚", color: "#7C3AED" },

      // Professional Exam Categories - Government & Banking
      { name: "UPSC CSE", description: "Union Public Service Commission - Civil Services Examination", categoryType: "professional_exam", examType: "UPSC_CSE", subjects: ["General_Studies", "Optional_Subject", "Essay", "English", "Hindi"], isActive: true, displayOrder: 40, icon: "🏛️", color: "#DC2626" },
      { name: "SSC CGL", description: "Staff Selection Commission - Combined Graduate Level", categoryType: "professional_exam", examType: "SSC_CGL", subjects: ["General_Intelligence", "General_Awareness", "Quantitative_Aptitude", "English"], isActive: true, displayOrder: 35, icon: "📝", color: "#7C2D12" },
      { name: "SSC CHSL", description: "Staff Selection Commission - Combined Higher Secondary Level", categoryType: "professional_exam", examType: "SSC_CHSL", subjects: ["General_Intelligence", "General_Awareness", "Quantitative_Aptitude", "English"], isActive: true, displayOrder: 36, icon: "📊", color: "#7C2D12" },
      { name: "SBI PO", description: "State Bank of India - Probationary Officer", categoryType: "professional_exam", examType: "SBI_PO", subjects: ["Reasoning", "Quantitative_Aptitude", "English", "General_Awareness", "Computer_Knowledge"], isActive: true, displayOrder: 45, icon: "🏦", color: "#1E40AF" },
      { name: "IBPS PO", description: "Institute of Banking Personnel Selection - Probationary Officer", categoryType: "professional_exam", examType: "IBPS_PO", subjects: ["Reasoning", "Quantitative_Aptitude", "English", "General_Awareness", "Computer_Knowledge"], isActive: true, displayOrder: 46, icon: "💳", color: "#1E40AF" },
      { name: "RBI Grade B", description: "Reserve Bank of India - Grade B Officer", categoryType: "professional_exam", examType: "RBI_Grade_B", subjects: ["Reasoning", "Quantitative_Aptitude", "English", "General_Awareness", "Economics", "Finance"], isActive: true, displayOrder: 47, icon: "🏛️", color: "#1E40AF" },

      // College Categories - Engineering Branches
      { name: "Computer Science Engineering", description: "Computer Science and Engineering Branch", categoryType: "college", engineeringBranch: "Computer_Science", subjects: ["Programming", "Data_Structures", "Algorithms", "Database_Systems", "Computer_Networks", "Software_Engineering"], isActive: true, displayOrder: 50, icon: "💻", color: "#059669" },
      { name: "Electronics & Communication Engineering", description: "Electronics and Communication Engineering Branch", categoryType: "college", engineeringBranch: "Electronics_Communication", subjects: ["Circuit_Analysis", "Digital_Electronics", "Signal_Processing", "Communication_Systems", "Microprocessors", "VLSI_Design"], isActive: true, displayOrder: 51, icon: "📡", color: "#059669" },
      { name: "Mechanical Engineering", description: "Mechanical Engineering Branch", categoryType: "college", engineeringBranch: "Mechanical", subjects: ["Thermodynamics", "Fluid_Mechanics", "Machine_Design", "Manufacturing_Processes", "Heat_Transfer", "Dynamics"], isActive: true, displayOrder: 52, icon: "⚙️", color: "#059669" },
      { name: "Civil Engineering", description: "Civil Engineering Branch", categoryType: "college", engineeringBranch: "Civil", subjects: ["Structural_Engineering", "Geotechnical_Engineering", "Transportation_Engineering", "Environmental_Engineering", "Fluid_Mechanics", "Construction_Management"], isActive: true, displayOrder: 53, icon: "🏗️", color: "#059669" },

      // College Categories - Medical Specializations
      { name: "MBBS General Medicine", description: "Bachelor of Medicine and Bachelor of Surgery - General Medicine", categoryType: "college", medicalBranch: "General_Medicine", subjects: ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Internal_Medicine"], isActive: true, displayOrder: 60, icon: "🩺", color: "#7C3AED" },
      { name: "MBBS Surgery", description: "Bachelor of Medicine and Bachelor of Surgery - Surgery Specialization", categoryType: "college", medicalBranch: "Surgery", subjects: ["Anatomy", "Physiology", "General_Surgery", "Surgical_Procedures", "Anesthesia", "Critical_Care"], isActive: true, displayOrder: 61, icon: "🔬", color: "#7C3AED" },
      { name: "MBBS Pediatrics", description: "Bachelor of Medicine and Bachelor of Surgery - Pediatrics Specialization", categoryType: "college", medicalBranch: "Pediatrics", subjects: ["Child_Development", "Pediatric_Medicine", "Neonatology", "Child_Psychology", "Vaccination", "Growth_Disorders"], isActive: true, displayOrder: 62, icon: "👶", color: "#7C3AED" }
    ];

    await db.insert(educationalCategories).values(categoriesToSeed as any);
  }

  // Uploader/Wallet operations
  async getUploaderStats(topperId: string): Promise<any> {
    const [userStats] = await db
      .select({
        totalUploads: count(notes.id),
        publishedNotes: count(sql`CASE WHEN ${notes.status} = 'published' THEN 1 END`),
        totalDownloads: sum(notes.downloadsCount),
        totalEarned: users.totalEarned,
      })
      .from(notes)
      .rightJoin(users, eq(users.id, topperId))
      .where(eq(notes.topperId, topperId))
      .groupBy(users.id, users.totalEarned);

    // Calculate wallet balance (1 rupee = 20 coins)
    const walletBalance = Math.floor((userStats?.totalEarned || 0) / 20);

    return {
      totalUploads: userStats?.totalUploads || 0,
      publishedNotes: userStats?.publishedNotes || 0,
      totalDownloads: userStats?.totalDownloads || 0,
      walletBalance,
    };
  }

  async getWithdrawalRequests(topperId: string): Promise<WithdrawalRequest[]> {
    return await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.topperId, topperId))
      .orderBy(desc(withdrawalRequests.requestedAt));
  }

  async createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [withdrawal] = await db
      .insert(withdrawalRequests)
      .values(request)
      .returning();
    return withdrawal;
  }

  // Admin withdrawal operations
  async getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    return await db
      .select()
      .from(withdrawalRequests)
      .orderBy(desc(withdrawalRequests.requestedAt));
  }

  async approveWithdrawalRequest(id: string, adminId: string): Promise<WithdrawalRequest> {
    const [withdrawal] = await db
      .update(withdrawalRequests)
      .set({
        status: 'approved',
        processedAt: new Date(),
        processedBy: adminId,
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return withdrawal;
  }

  async rejectWithdrawalRequest(id: string, adminId: string, reason: string): Promise<WithdrawalRequest> {
    const [withdrawal] = await db
      .update(withdrawalRequests)
      .set({
        status: 'rejected',
        processedAt: new Date(),
        processedBy: adminId,
        rejectionReason: reason,
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return withdrawal;
  }

  async settleWithdrawalRequest(id: string, adminId: string, comments?: string): Promise<WithdrawalRequest> {
    const [withdrawal] = await db
      .update(withdrawalRequests)
      .set({
        status: 'settled',
        processedAt: new Date(),
        processedBy: adminId,
        adminComments: comments,
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return withdrawal;
  }
}

export const storage = new DatabaseStorage();
