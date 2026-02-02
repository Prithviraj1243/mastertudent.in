// Admin Account methods for DatabaseStorage - to be added to storage.ts

// Add these methods inside the DatabaseStorage class before the closing brace:

async getAdminByUsername(username: string): Promise<any> {
  const { adminAccounts, eq } = await import('@shared/schema');
  const [admin] = await db.select().from(adminAccounts).where(eq(adminAccounts.username, username));
  return admin;
}

async getAdminById(id: string): Promise<any> {
  const { adminAccounts, eq } = await import('@shared/schema');
  const [admin] = await db.select().from(adminAccounts).where(eq(adminAccounts.id, id));
  return admin;
}

async updateAdminLastLogin(id: string): Promise<void> {
  const { adminAccounts, eq } = await import('@shared/schema');
  await db.update(adminAccounts).set({ lastLogin: new Date(), updatedAt: new Date() }).where(eq(adminAccounts.id, id));
}

async createAdminSession(session: { adminAccountId: string; token: string; ipAddress?: string; userAgent?: string; expiresAt: Date }): Promise<void> {
  const { adminSessions } = await import('@shared/schema');
  await db.insert(adminSessions).values({
    adminAccountId: session.adminAccountId,
    token: session.token,
    ipAddress: session.ipAddress || null,
    userAgent: session.userAgent || null,
    expiresAt: session.expiresAt,
    lastActivity: new Date(),
  } as any);
}

async getAdminSession(token: string): Promise<any> {
  const { adminSessions, eq } = await import('@shared/schema');
  const [session] = await db.select().from(adminSessions).where(eq(adminSessions.token, token));
  return session;
}

async updateAdminSessionActivity(token: string): Promise<void> {
  const { adminSessions, eq } = await import('@shared/schema');
  await db.update(adminSessions).set({ lastActivity: new Date() }).where(eq(adminSessions.token, token));
}

async deleteAdminSession(token: string): Promise<void> {
  const { adminSessions, eq } = await import('@shared/schema');
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

async recordAdminActivity(adminId: string, action: string, targetType: string, targetId: string, metadata?: any): Promise<void> {
  console.log(\`Admin \${adminId} performed \${action} on \${targetType} \${targetId}\`, metadata);
}

async getReviewTaskByNoteId(noteId: string): Promise<any> {
  const [task] = await db.select().from(reviewTasks).where(eq(reviewTasks.noteId, noteId));
  return task;
}

async updateReviewTaskStatus(id: string, status: string): Promise<any> {
  const [task] = await db.update(reviewTasks).set({ status: status as any }).where(eq(reviewTasks.id, id)).returning();
  return task;
}

async createNotification(notification: { userId: string; type: string; title: string; body?: string; link?: string }): Promise<any> {
  const [notif] = await db.insert(notifications).values(notification).returning();
  return notif;
}
