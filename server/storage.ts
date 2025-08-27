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
    limit?: number;
    offset?: number;
  }): Promise<{ notes: Note[]; total: number }> {
    const conditions = [eq(notes.status, 'published')];
    
    if (filters?.subject) {
      conditions.push(eq(notes.subject, filters.subject));
    }
    
    if (filters?.classGrade) {
      conditions.push(eq(notes.classGrade, filters.classGrade));
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
        .select()
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
      notes: notesResult,
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
}

export const storage = new DatabaseStorage();
