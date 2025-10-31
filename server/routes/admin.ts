import { Router } from "express";
import { db } from "../db";
import { users, notes, transactions } from "../db/schema";
import { eq, desc, count, sum, and } from "drizzle-orm";

const router = Router();

// Get all users with stats
router.get("/users", async (req, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    
    res.json(allUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      coins: user.coins || 0
    })));
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user statistics
router.get("/user-stats", async (req, res) => {
  try {
    const totalUsers = await db.select({ count: count() }).from(users);
    const activeUsers = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    const toppers = await db.select({ count: count() }).from(users).where(eq(users.role, 'topper'));
    
    // Get users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await db.select({ count: count() }).from(users).where(
      and(
        eq(users.createdAt, today)
      )
    );

    res.json({
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      toppers: toppers[0]?.count || 0,
      newToday: newToday[0]?.count || 0
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

// Get all notes with stats
router.get("/notes", async (req, res) => {
  try {
    const allNotes = await db.select().from(notes).orderBy(desc(notes.createdAt));
    
    res.json(allNotes.map(note => ({
      id: note.id,
      title: note.title,
      subject: note.subject,
      uploader: note.uploaderId,
      status: note.status || 'pending',
      downloads: note.downloads || 0,
      createdAt: note.createdAt,
      price: note.price || 0
    })));
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Get notes statistics
router.get("/note-stats", async (req, res) => {
  try {
    const totalNotes = await db.select({ count: count() }).from(notes);
    const approved = await db.select({ count: count() }).from(notes).where(eq(notes.status, 'approved'));
    const pending = await db.select({ count: count() }).from(notes).where(eq(notes.status, 'pending'));
    const totalDownloads = await db.select({ sum: sum(notes.downloads) }).from(notes);

    res.json({
      totalNotes: totalNotes[0]?.count || 0,
      approved: approved[0]?.count || 0,
      pending: pending[0]?.count || 0,
      totalDownloads: totalDownloads[0]?.sum || 0
    });
  } catch (error) {
    console.error("Error fetching note stats:", error);
    res.status(500).json({ error: "Failed to fetch note stats" });
  }
});

// Get all transactions
router.get("/transactions", async (req, res) => {
  try {
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    
    res.json(allTransactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.createdAt,
      user: `User ${transaction.userId}`,
      date: transaction.createdAt?.toLocaleDateString() || 'Unknown'
    })));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get coin statistics
router.get("/coin-stats", async (req, res) => {
  try {
    const totalCoins = await db.select({ sum: sum(users.coins) }).from(users);
    const earnedCoins = await db.select({ sum: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, 'earn'));
    const spentCoins = await db.select({ sum: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, 'spend'));

    res.json({
      totalCoins: totalCoins[0]?.sum || 0,
      earned: earnedCoins[0]?.sum || 0,
      spent: spentCoins[0]?.sum || 0
    });
  } catch (error) {
    console.error("Error fetching coin stats:", error);
    res.status(500).json({ error: "Failed to fetch coin stats" });
  }
});

// Get withdrawals (existing endpoint)
router.get("/withdrawals", async (req, res) => {
  try {
    // This would fetch from a withdrawals table if it exists
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

export default router;
