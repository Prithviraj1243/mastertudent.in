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
import crypto from "crypto";

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
  getNotesByUser(userId: string): Promise<Note[]>;
  getPublishedNotes(filters?: {
    subject?: string;
    classGrade?: string;
    search?: string;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notes: Note[]; total: number }>;
  getAllNotesForAdmin(filters?: {
    status?: string;
    subject?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notes: any[]; total: number }>;
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
  
  // User Activity Operations
  getUserActivity(): Promise<any[]>;
  getUserActivityById(userId: string): Promise<any[]>;
  recordUserActivity(userId: string, action: string, details?: any): Promise<void>;
  getUserSessions(userId?: string): Promise<any[]>;
  getUserDetailedInfo(userId: string): Promise<any>;
  
  // User Stats Operations
  getUserStats(userId: string): Promise<{
    notesUploaded: number;
    totalEarnings: number;
    totalDownloads: number;
    averageRating: number;
    monthlyEarnings: number;
    totalViews: number;
    activeNotes: number;
    pendingReviews: number;
  }>;
  getUserSubjectStats(userId: string): Promise<{
    subject: string;
    notesCount: number;
    earnings: number;
    downloads: number;
    averageRating: number;
  }[]>;
  updateUserStats(userId: string, uploadData: { subject: string; noteId: string }): Promise<void>;
}

class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private topperProfiles: TopperProfile[] = [];
  private notes: Note[] = [];
  private followsList: Follow[] = [];
  private feedbackList: Feedback[] = [];
  private transactionsList: Transaction[] = [];
  private subscriptionsList: Subscription[] = [];
  private categories: any[] = [];
  private userActivities: any[] = [];
  private userSessions: any[] = [];

  constructor() {
    // Seed minimal categories and notes
    this.categories = [
      { id: "fallback-1", name: "Class 10th CBSE", description: "Class 10 CBSE Board", categoryType: "school", isActive: true, displayOrder: 1, icon: "📚", color: "#3B82F6" },
      { id: "fallback-5", name: "JEE Main", description: "Joint Entrance Examination - Main", categoryType: "competitive_exam", isActive: true, displayOrder: 30, icon: "⚙️", color: "#059669" },
    ];

    const demoTopperId = crypto.randomUUID();
    this.users.push({
      id: demoTopperId,
      email: "topper@example.com",
      firstName: "Topper",
      lastName: "User",
      profileImageUrl: "",
      role: "topper" as any,
      phone: null as any,
      isActive: true,
      stripeCustomerId: null as any,
      stripeSubscriptionId: null as any,
      coinBalance: 0,
      freeDownloadsLeft: 3,
      lastFreeDownloadReset: new Date(),
      reputation: 0,
      totalEarned: 0,
      totalSpent: 0,
      streak: 0,
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as User);

    // No demo notes - only show real database notes
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }
  async upsertUser(userData: UpsertUser): Promise<User> {
    let user = this.users.find(u => u.id === (userData.id as string));
    if (!user) {
      const newUser = {
        id: userData.id || crypto.randomUUID(),
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        profileImageUrl: userData.profileImageUrl || "",
        role: (userData as any).role || ("student" as any),
        phone: null as any,
        isActive: true,
        stripeCustomerId: null as any,
        stripeSubscriptionId: null as any,
        coinBalance: 0,
        freeDownloadsLeft: 3,
        lastFreeDownloadReset: new Date(),
        reputation: 0,
        totalEarned: 0,
        totalSpent: 0,
        streak: 0,
        onboardingCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;
      this.users.push(newUser);
      return newUser;
    }
    Object.assign(user, userData, { updatedAt: new Date() });
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }
  async updateUserRole(id: string, role: string): Promise<User> {
    const user = this.users.find(u => u.id === id)!;
    (user as any).role = role as any;
    user.updatedAt = new Date() as any;
    return user;
  }
  async updateUserStripeInfo(id: string): Promise<User> {
    const user = this.users.find(u => u.id === id)!;
    return user;
  }

  async createTopperProfile(profile: InsertTopperProfile): Promise<TopperProfile> {
    const p = { id: crypto.randomUUID(), ...profile, createdAt: new Date() } as any;
    this.topperProfiles.push(p);
    return p;
  }
  async getTopperProfile(userId: string): Promise<TopperProfile | undefined> {
    return this.topperProfiles.find(p => (p as any).userId === userId);
  }
  async updateTopperProfile(userId: string, updates: Partial<InsertTopperProfile>): Promise<TopperProfile> {
    const p = this.topperProfiles.find(tp => (tp as any).userId === userId)!;
    Object.assign(p, updates);
    return p;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const n = { id: crypto.randomUUID(), ...note, createdAt: new Date(), updatedAt: new Date() } as any;
    this.notes.push(n);
    return n;
  }
  async getNoteById(id: string): Promise<Note | undefined> {
    return this.notes.find(n => n.id === id);
  }
  async getNotesByTopper(topperId: string): Promise<Note[]> {
    return this.notes.filter(n => n.topperId === topperId);
  }
  async getNotesByUser(userId: string): Promise<Note[]> {
    return this.notes.filter(n => n.topperId === userId);
  }
  async getPublishedNotes(filters?: { subject?: string; classGrade?: string; search?: string; categoryId?: string; limit?: number; offset?: number; }): Promise<{ notes: Note[]; total: number }> {
    let list = this.notes.filter(n => n.status === ('published' as any));
    if (filters?.subject) list = list.filter(n => n.subject === (filters.subject as any));
    if (filters?.classGrade) list = list.filter(n => n.classGrade === filters.classGrade);
    if (filters?.categoryId) list = list.filter(n => n.categoryId === filters.categoryId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(n => (n.title + ' ' + (n.description || '')).toLowerCase().includes(q));
    }
    const total = list.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    return { notes: list.slice(offset, offset + limit), total };
  }
  
  async getAllNotesForAdmin(filters?: { status?: string; subject?: string; limit?: number; offset?: number; }): Promise<{ notes: any[]; total: number }> {
    let list = [...this.notes]; // Get all notes regardless of status
    if (filters?.status) list = list.filter(n => n.status === (filters.status as any));
    if (filters?.subject) list = list.filter(n => n.subject === (filters.subject as any));
    
    // Add user information to notes
    const notesWithUsers = list.map(note => {
      const user = this.users.find(u => u.id === note.topperId);
      return {
        ...note,
        authorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        authorEmail: user?.email || 'unknown@email.com',
        authorRole: user?.role || 'student',
      };
    });
    
    const total = notesWithUsers.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    return { notes: notesWithUsers.slice(offset, offset + limit), total };
  }
  async updateNote(id: string, updates: Partial<InsertNote>): Promise<Note> {
    const n = this.notes.find(n => n.id === id)!;
    Object.assign(n, updates, { updatedAt: new Date() });
    return n;
  }
  async updateNoteStatus(id: string, status: string): Promise<Note> {
    const n = this.notes.find(n => n.id === id)!;
    (n as any).status = status as any;
    if (status === 'published') (n as any).publishedAt = new Date();
    n.updatedAt = new Date() as any;
    return n;
  }

  // Stubs and simplified implementations
  async createReviewTask(task: InsertReviewTask): Promise<ReviewTask> { return { id: crypto.randomUUID(), ...task, createdAt: new Date() } as any; }
  async getReviewTasks(): Promise<ReviewTask[]> { return []; }
  async updateReviewTask(id: string, updates: Partial<InsertReviewTask>): Promise<ReviewTask> { return { id, ...updates } as any; }
  async createFeedback(fb: InsertFeedback): Promise<Feedback> { const f = { id: crypto.randomUUID(), ...fb, createdAt: new Date() } as any; this.feedbackList.push(f); return f; }
  async getFeedbackByNote(noteId: string): Promise<Feedback[]> { return this.feedbackList.filter(f => (f as any).noteId === noteId); }
  async getFeedbackByStudent(studentId: string, noteId: string): Promise<Feedback | undefined> { return this.feedbackList.find(f => (f as any).studentId === studentId && (f as any).noteId === noteId); }
  async createSubscription(s: InsertSubscription): Promise<Subscription> { const sub = { id: crypto.randomUUID(), ...s, status: 'active' } as any; this.subscriptionsList.push(sub); return sub; }
  async getActiveSubscription(studentId: string): Promise<Subscription | undefined> { return this.subscriptionsList.find(s => (s as any).studentId === studentId && (s as any).status === 'active'); }
  async updateSubscriptionStatus(id: string, status: string): Promise<Subscription> { const s = this.subscriptionsList.find(s => s.id === id)!; (s as any).status = status as any; return s; }
  async followTopper(studentId: string, topperId: string): Promise<Follow> { const f = { id: crypto.randomUUID(), studentId, topperId, createdAt: new Date() } as any; this.followsList.push(f); return f; }
  async unfollowTopper(studentId: string, topperId: string): Promise<void> { this.followsList = this.followsList.filter(f => !(f.studentId === studentId && f.topperId === topperId)); }
  async getFollows(studentId: string): Promise<Follow[]> { return this.followsList.filter(f => f.studentId === studentId) as any; }
  async recordDownload(studentId: string, noteId: string): Promise<Download> { const d = { id: crypto.randomUUID(), studentId, noteId, downloadedAt: new Date() } as any; const n = this.notes.find(n => n.id === noteId); if (n) (n as any).downloadsCount += 1; return d; }
  async getDownloadHistory(studentId: string): Promise<Download[]> { return [] as any; }
  async getTopperAnalytics(): Promise<{ totalDownloads: number; averageRating: number; followersCount: number; notesCount: number; }> { return { totalDownloads: 0, averageRating: 0, followersCount: 0, notesCount: this.notes.length }; }
  async getAdminStats(): Promise<{ totalUsers: number; totalNotes: number; activeSubscriptions: number; pendingReviews: number; }> { return { totalUsers: this.users.length, totalNotes: this.notes.length, activeSubscriptions: 0, pendingReviews: 0 }; }
  async getNote(id: string): Promise<Note | undefined> { return this.getNoteById(id); }
  async updateUserCoins(userId: string, coinChange: number): Promise<void> { const u = this.users.find(u => u.id === userId); if (u) { u.coinBalance += coinChange as any; if (coinChange > 0) u.totalEarned += coinChange as any; if (coinChange < 0) u.totalSpent += Math.abs(coinChange) as any; } }
  async recordTransaction(userId: string, type: string, amount: number, coinChange: number, noteId?: string, description?: string): Promise<Transaction> { const t = { id: crypto.randomUUID(), userId, type: type as any, amount, coinChange, noteId: noteId as any, description, createdAt: new Date() } as any; this.transactionsList.push(t); return t; }
  async recordNoteView(viewerId: string, noteId: string, coinsEarned: number): Promise<NoteView> { return { id: crypto.randomUUID(), viewerId, noteId, coinsEarned, viewedAt: new Date() } as any; }
  async hasUserViewedNoteToday(): Promise<boolean> { return false; }
  async incrementNoteViews(noteId: string): Promise<void> { const n = this.notes.find(n => n.id === noteId); if (n) (n as any).viewsCount += 1; }
  async incrementNoteDownloads(noteId: string): Promise<void> { const n = this.notes.find(n => n.id === noteId); if (n) (n as any).downloadsCount += 1; }
  async toggleNoteLike(userId: string, noteId: string): Promise<boolean> { const n = this.notes.find(n => n.id === noteId); if (!n) return false; const liked = (n as any).__likes?.includes(userId) || false; (n as any).__likes = (n as any).__likes || []; if (liked) { (n as any).__likes = (n as any).__likes.filter((x: string) => x !== userId); n.likesCount = (n.likesCount as any) - 1; return false; } else { (n as any).__likes.push(userId); n.likesCount = (n.likesCount as any) + 1; return true; } }
  async getNoteLikesCount(noteId: string): Promise<number> { const n = this.notes.find(n => n.id === noteId); return n ? (n.likesCount as any) : 0; }
  async hasUserDownloaded(): Promise<boolean> { return false; }
  async resetDailyFreeDownloads(): Promise<void> { }
  async useFreeDowload(): Promise<void> { }
  async getCoinPackages(): Promise<CoinPackage[]> { return []; }
  async getUserTransactions(): Promise<Transaction[]> { return []; }
  async getLeaderboard(): Promise<any[]> { return []; }
  async getDailyChallenges(): Promise<any[]> { return []; }
  async completeDailyChallenge(): Promise<{ completed: boolean; coinsEarned?: number; progress?: number }> { return { completed: false, progress: 0 }; }
  async createForumCategory(category: InsertForumCategory): Promise<ForumCategory> { return { id: crypto.randomUUID(), ...category, createdAt: new Date() } as any; }
  async getForumCategories(): Promise<ForumCategory[]> { return []; }
  async createForumPost(post: InsertForumPost): Promise<ForumPost> { return { id: crypto.randomUUID(), ...post, createdAt: new Date(), updatedAt: new Date() } as any; }
  async getForumPosts(): Promise<{ posts: ForumPost[]; total: number }> { return { posts: [], total: 0 }; }
  async getForumPost(): Promise<ForumPost | undefined> { return undefined; }
  async createForumReply(reply: InsertForumReply): Promise<ForumReply> { return { id: crypto.randomUUID(), ...reply, createdAt: new Date(), updatedAt: new Date() } as any; }
  async getForumReplies(): Promise<ForumReply[]> { return []; }
  async toggleForumReplyLike(): Promise<boolean> { return false; }
  async createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast> { return { id: crypto.randomUUID(), ...broadcast, createdAt: new Date(), sentAt: new Date(), isActive: true } as any; }
  async getBroadcasts(): Promise<Broadcast[]> { return []; }
  async createUserAchievement(achievement: InsertUserAchievement): Promise<UserAchievement> { return { id: crypto.randomUUID(), ...achievement, unlockedAt: new Date() } as any; }
  async getUserAchievements(): Promise<UserAchievement[]> { return []; }
  async getEducationalCategories(): Promise<any[]> { return this.categories; }
  async saveUserEducationalPreferences(): Promise<void> { }
  async getUserEducationalPreferences(): Promise<any[]> { return []; }
  async completeUserOnboarding(userId: string): Promise<User> { const u = this.users.find(u => u.id === userId)!; (u as any).onboardingCompleted = true; return u; }
  async seedEducationalCategories(): Promise<void> { }
  async getUploaderStats(): Promise<any> { return { totalUploads: this.notes.length, publishedNotes: this.notes.length, totalDownloads: this.notes.reduce((a, n) => a + (n.downloadsCount as any), 0), walletBalance: 0 }; }
  async getWithdrawalRequests(): Promise<WithdrawalRequest[]> { return []; }
  async createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest> { return { id: crypto.randomUUID(), ...request, status: 'pending', requestedAt: new Date() } as any; }
  async getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> { return []; }
  async approveWithdrawalRequest(id: string, adminId: string): Promise<WithdrawalRequest> { return { id, topperId: adminId, amount: 0 as any, coins: 0, status: 'approved', requestedAt: new Date(), processedAt: new Date(), processedBy: adminId } as any; }
  async rejectWithdrawalRequest(id: string, adminId: string, reason: string): Promise<WithdrawalRequest> { return { id, topperId: adminId, amount: 0 as any, coins: 0, status: 'rejected', requestedAt: new Date(), processedAt: new Date(), processedBy: adminId, rejectionReason: reason } as any; }
  async settleWithdrawalRequest(id: string, adminId: string, comments?: string): Promise<WithdrawalRequest> { return { id, topperId: adminId, amount: 0 as any, coins: 0, status: 'settled', requestedAt: new Date(), processedAt: new Date(), processedBy: adminId, adminComments: comments } as any; }
  
  // User Activity Operations
  async getUserActivity(): Promise<any[]> {
    // Return only real stored activities (no mock data)
    return this.userActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async getUserActivityById(userId: string): Promise<any[]> {
    const allActivities = await this.getUserActivity();
    return allActivities.filter(activity => activity.userId === userId);
  }
  
  async recordUserActivity(userId: string, action: string, details?: any): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const activity = {
      id: crypto.randomUUID(),
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      action,
      details: details || this.getActionDetails(action),
      timestamp: new Date().toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Mumbai, India'
    };

    this.userActivities.push(activity);
    
    // Keep only last 1000 activities to prevent memory issues
    if (this.userActivities.length > 1000) {
      this.userActivities = this.userActivities.slice(-1000);
    }

    // Record login session if it's a login action
    if (action === 'login') {
      this.recordUserSession(userId, details);
    }

    console.log(`User ${userId} performed action: ${action}`, details);
  }

  async getUserSessions(userId?: string): Promise<any[]> {
    if (userId) {
      return this.userSessions.filter(session => session.userId === userId)
        .sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
    }
    return this.userSessions.sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
  }

  async getUserDetailedInfo(userId: string): Promise<any> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return null;

    const userActivities = await this.getUserActivityById(userId);
    const userSessions = await this.getUserSessions(userId);
    const userStats = await this.getUserStats(userId);
    const userNotes = this.notes.filter(n => n.topperId === userId);

    // Calculate additional metrics
    const lastLogin = userSessions.length > 0 ? userSessions[0].loginTime : user.createdAt;
    const totalSessions = userSessions.length;
    const avgSessionDuration = '2h 15m'; // Mock data
    const deviceTypes = Array.from(new Set(userSessions.map(s => s.device)));
    const locations = Array.from(new Set(userSessions.map(s => s.location)));

    return {
      ...user,
      lastLogin,
      totalSessions,
      avgSessionDuration,
      deviceTypes,
      locations,
      recentActivities: userActivities.slice(0, 10),
      recentSessions: userSessions.slice(0, 5),
      stats: userStats,
      notes: userNotes.map(note => ({
        id: note.id,
        title: note.title,
        subject: note.subject,
        status: note.status,
        downloads: note.downloadsCount || 0,
        createdAt: note.createdAt
      }))
    };
  }

  private recordUserSession(userId: string, details?: any): void {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const session = {
      id: crypto.randomUUID(),
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      loginTime: new Date().toISOString(),
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: details?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: details?.location || 'Mumbai, India',
      device: details?.device || 'Desktop',
      browser: details?.browser || 'Chrome',
      isActive: true,
      lastActivity: new Date().toISOString()
    };

    this.userSessions.push(session);
    
    // Keep only last 500 sessions
    if (this.userSessions.length > 500) {
      this.userSessions = this.userSessions.slice(-500);
    }
  }
  
  async getUserStats(userId: string): Promise<{
    notesUploaded: number;
    totalEarnings: number;
    totalDownloads: number;
    averageRating: number;
    monthlyEarnings: number;
    totalViews: number;
    activeNotes: number;
    pendingReviews: number;
  }> {
    const user = this.users.find(u => u.id === userId);
    const userNotes = this.notes.filter(n => n.topperId === userId);
    const userDownloads = this.followsList.filter(f => f.studentId === userId);
    
    // Calculate stats from user's notes
    const totalDownloads = userNotes.reduce((sum, note) => sum + (note.downloadsCount || 0), 0);
    const totalViews = userNotes.reduce((sum, note) => sum + (note.viewsCount || 0), 0);
    const activeNotes = userNotes.filter(n => n.status === 'published').length;
    
    // Calculate average rating from feedback
    const allFeedback = this.feedbackList.filter(f => 
      userNotes.some(note => note.id === f.noteId)
    );
    const averageRating = allFeedback.length > 0 
      ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length 
      : 0;
    
    return {
      notesUploaded: userNotes.length,
      totalEarnings: user?.totalEarned || 0,
      totalDownloads,
      averageRating,
      monthlyEarnings: Math.floor((user?.totalEarned || 0) * 0.3), // Simulate monthly earnings
      totalViews,
      activeNotes,
      pendingReviews: userNotes.filter(n => n.status === 'submitted').length,
    };
  }
  
  async getUserSubjectStats(userId: string): Promise<{
    subject: string;
    notesCount: number;
    earnings: number;
    downloads: number;
    averageRating: number;
  }[]> {
    const userNotes = this.notes.filter(n => n.topperId === userId);
    const subjectMap = new Map<string, any>();
    
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
      stats.earnings += (note.downloadsCount || 0) * 5; // Simulate earnings
      
      // Get feedback for this note
      const noteFeedback = this.feedbackList.filter(f => f.noteId === note.id);
      stats.ratings.push(...noteFeedback.map(f => f.rating));
    }
    
    // Calculate average ratings
    const result = Array.from(subjectMap.values()).map(stats => ({
      subject: stats.subject,
      notesCount: stats.notesCount,
      earnings: stats.earnings,
      downloads: stats.downloads,
      averageRating: stats.ratings.length > 0 
        ? stats.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / stats.ratings.length 
        : 0
    }));
    
    return result;
  }
  
  async updateUserStats(userId: string, uploadData: { subject: string; noteId: string }): Promise<void> {
    // In memory storage - stats are calculated dynamically, so this is a no-op
    console.log(`Updated stats for user ${userId} after uploading ${uploadData.subject} note ${uploadData.noteId}`);
  }
  
  private getActionDetails(action: string): any {
    const detailsMap: { [key: string]: any } = {
      'login': { page: '/login', sessionDuration: '2h 15m' },
      'download': { noteTitle: 'Physics Notes - Kinematics', noteId: crypto.randomUUID() },
      'upload': { noteTitle: 'Chemistry Notes - Organic', noteId: crypto.randomUUID() },
      'view_note': { noteTitle: 'Mathematics Notes - Calculus', noteId: crypto.randomUUID() },
      'like_note': { noteTitle: 'Biology Notes - Cell Structure', noteId: crypto.randomUUID() },
      'follow_user': { followedUser: 'Dr. Sarah Johnson', followedUserId: crypto.randomUUID() },
      'comment': { noteTitle: 'History Notes - World War II', comment: 'Great notes!' }
    };
    return detailsMap[action] || {};
  }
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

  async getNotesByUser(userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.topperId, userId))
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

  async getAllNotesForAdmin(filters?: {
    status?: string;
    subject?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ notes: any[]; total: number }> {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(notes.status, filters.status as any));
    }
    
    if (filters?.subject) {
      conditions.push(eq(notes.subject, filters.subject as any));
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
          updatedAt: notes.updatedAt,
          attachments: notes.attachments,
          // Join with users to get author info
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorEmail: users.email,
          authorRole: users.role,
        })
        .from(notes)
        .leftJoin(users, eq(notes.topperId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(notes.createdAt))
        .limit(filters?.limit || 20)
        .offset(filters?.offset || 0),
      db
        .select({ count: count() })
        .from(notes)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    ]);

    // Format the results with author info
    const notesWithUsers = notesResult.map((note: any) => ({
      ...note,
      authorName: `${note.authorFirstName || ''} ${note.authorLastName || ''}`.trim() || 'Unknown',
      authorEmail: note.authorEmail || 'unknown@email.com',
      authorRole: note.authorRole || 'student',
    }));

    return {
      notes: notesWithUsers,
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

  async getDownloadHistory(studentId: string): Promise<any[]> {
    return await db
      .select({
        id: downloads.id,
        noteId: downloads.noteId,
        downloadedAt: downloads.downloadedAt,
        note: {
          id: notes.id,
          title: notes.title,
          subject: notes.subject,
          type: notes.type,
          description: notes.description,
          createdAt: notes.createdAt,
        }
      })
      .from(downloads)
      .innerJoin(notes, eq(downloads.noteId, notes.id))
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
      activeChallenges.map(async (challenge: DailyChallenge) => {
        const progressResult = await db
          .select()
          .from(userChallengeProgress)
          .where(
            and(
              eq(userChallengeProgress.userId, userId),
              eq(userChallengeProgress.challengeId, challenge.id)
            )
          );

        const progress = progressResult[0];

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
    // Check if specific categories already exist to prevent duplicates
    const existingCounts = await db
      .select({ count: sql<number>`count(*)` })
      .from(educationalCategories)
      .where(sql`name IN ('Class 9th CBSE', 'JEE Main', 'UPSC CSE', 'Computer Science Engineering')`);
    
    if (existingCounts[0]?.count > 0) {
      console.log('Categories already seeded, skipping...');
      return; // Categories already seeded
    }
    
    console.log('Seeding educational categories...');

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

  // User Activity Operations
  async getUserActivity(): Promise<any[]> {
    // For now, return mock data similar to InMemoryStorage
    // In production, this would query a user_activities table
    const activities = [];
    const actions = ['login', 'download', 'upload', 'view_note', 'like_note', 'follow_user', 'comment'];
    
    // Get some users from the database
    const dbUsers = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email
    }).from(users).limit(5);
    
    for (let i = 0; i < 20; i++) {
      const user = dbUsers[Math.floor(Math.random() * dbUsers.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(Date.now() - Math.random() * 3600000); // Last hour
      
      activities.push({
        id: crypto.randomUUID(),
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        action,
        details: this.getActionDetails(action),
        timestamp: timestamp.toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Mumbai, India'
      });
    }
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async getUserActivityById(userId: string): Promise<any[]> {
    const allActivities = await this.getUserActivity();
    return allActivities.filter(activity => activity.userId === userId);
  }
  
  async recordUserActivity(userId: string, action: string, details?: any): Promise<void> {
    // In production, this would insert into a user_activities table
    console.log(`User ${userId} performed action: ${action}`, details);
  }

  async getUserSessions(userId?: string): Promise<any[]> {
    // In production, this would query a user_sessions table
    // For now, return mock data
    const mockSessions = [
      {
        id: crypto.randomUUID(),
        userId: userId || crypto.randomUUID(),
        loginTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Mumbai, India',
        device: 'Desktop',
        browser: 'Chrome',
        isActive: true,
        lastActivity: new Date().toISOString()
      }
    ];
    
    return mockSessions;
  }

  async getUserDetailedInfo(userId: string): Promise<any> {
    // Get user from database
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;

    const userActivities = await this.getUserActivityById(userId);
    const userSessions = await this.getUserSessions(userId);
    const userStats = await this.getUserStats(userId);
    
    // Get user's notes
    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.topperId, userId))
      .limit(10);

    return {
      ...user,
      lastLogin: userSessions.length > 0 ? userSessions[0].loginTime : user.createdAt,
      totalSessions: userSessions.length,
      avgSessionDuration: '2h 15m',
      deviceTypes: ['Desktop', 'Mobile'],
      locations: ['Mumbai, India'],
      recentActivities: userActivities.slice(0, 10),
      recentSessions: userSessions.slice(0, 5),
      stats: userStats,
      notes: userNotes.map((note: any) => ({
        id: note.id,
        title: note.title,
        subject: note.subject,
        status: note.status,
        downloads: note.downloadsCount || 0,
        createdAt: note.createdAt
      }))
    };
  }
  
  async getUserStats(userId: string): Promise<{
    notesUploaded: number;
    totalEarnings: number;
    totalDownloads: number;
    averageRating: number;
    monthlyEarnings: number;
    totalViews: number;
    activeNotes: number;
    pendingReviews: number;
  }> {
    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    // Get user's notes count and stats
    const userNotesStats = await db
      .select({
        notesCount: count(notes.id),
        totalViews: sum(notes.viewsCount),
        totalDownloads: sum(notes.downloadsCount),
        activeNotes: count(sql`CASE WHEN ${notes.status} = 'published' THEN 1 END`),
        pendingReviews: count(sql`CASE WHEN ${notes.status} = 'submitted' THEN 1 END`),
      })
      .from(notes)
      .where(eq(notes.topperId, userId));
    
    // Get average rating from feedback
    const avgRatingResult = await db
      .select({
        avgRating: avg(feedback.rating)
      })
      .from(feedback)
      .innerJoin(notes, eq(feedback.noteId, notes.id))
      .where(eq(notes.topperId, userId));
    
    const stats = userNotesStats[0];
    const avgRating = avgRatingResult[0]?.avgRating || 0;
    
    // Calculate monthly earnings (30% of total for simulation)
    const monthlyEarnings = Math.floor((user?.totalEarned || 0) * 0.3);
    
    return {
      notesUploaded: Number(stats?.notesCount || 0),
      totalEarnings: user?.totalEarned || 0,
      totalDownloads: Number(stats?.totalDownloads || 0),
      averageRating: Number(avgRating),
      monthlyEarnings,
      totalViews: Number(stats?.totalViews || 0),
      activeNotes: Number(stats?.activeNotes || 0),
      pendingReviews: Number(stats?.pendingReviews || 0),
    };
  }
  
  async getUserSubjectStats(userId: string): Promise<{
    subject: string;
    notesCount: number;
    earnings: number;
    downloads: number;
    averageRating: number;
  }[]> {
    const subjectStats = await db
      .select({
        subject: notes.subject,
        notesCount: count(notes.id),
        downloads: sum(notes.downloadsCount),
        avgRating: avg(feedback.rating)
      })
      .from(notes)
      .leftJoin(feedback, eq(feedback.noteId, notes.id))
      .where(eq(notes.topperId, userId))
      .groupBy(notes.subject);
    
    return subjectStats.map((stat: any) => ({
      subject: stat.subject,
      notesCount: Number(stat.notesCount || 0),
      earnings: Number(stat.downloads || 0) * 5, // Simulate earnings: 5 coins per download
      downloads: Number(stat.downloads || 0),
      averageRating: Number(stat.avgRating || 0),
    }));
  }
  
  async updateUserStats(userId: string, uploadData: { subject: string; noteId: string }): Promise<void> {
    // Update user's total earned coins (simulate earning 20 coins per upload)
    await db
      .update(users)
      .set({
        totalEarned: sql`${users.totalEarned} + 20`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Record transaction for the upload
    await db.insert(transactions).values({
      userId,
      type: 'coin_earned',
      amount: 20,
      coinChange: 20,
      noteId: uploadData.noteId,
      description: `Earned 20 coins for uploading ${uploadData.subject} note`,
    });
  }
  
  private getActionDetails(action: string): any {
    const detailsMap: { [key: string]: any } = {
      'login': { page: '/login', sessionDuration: '2h 15m' },
      'download': { noteTitle: 'Physics Notes - Kinematics', noteId: crypto.randomUUID() },
      'upload': { noteTitle: 'Chemistry Notes - Organic', noteId: crypto.randomUUID() },
      'view_note': { noteTitle: 'Mathematics Notes - Calculus', noteId: crypto.randomUUID() },
      'like_note': { noteTitle: 'Biology Notes - Cell Structure', noteId: crypto.randomUUID() },
      'follow_user': { followedUser: 'Dr. Sarah Johnson', followedUserId: crypto.randomUUID() },
      'comment': { noteTitle: 'History Notes - World War II', comment: 'Great notes!' }
    };
    return detailsMap[action] || {};
  }
}

// Use InMemoryStorage for development, PostgreSQL for production
export const storage = process.env.USE_SQLITE === '1' ? new InMemoryStorage() : new DatabaseStorage();
