import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tasks, taskHistory, pointsSystem, medals, medalHistory, treasureProgress, parentSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== TASKS HELPERS =====

export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getTasksByCategory(category: "daily" | "weekly" | "monthly") {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tasks).where(eq(tasks.category, category)).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTask(task: any) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(tasks).values(task);
  return result;
}

export async function updateTask(id: number, updates: any) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.update(tasks).set(updates).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.delete(tasks).where(eq(tasks.id, id));
}

export async function completeTask(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const task = await getTaskById(id);
  if (!task) return null;

  // Update task as completed
  await db.update(tasks).set({ 
    completed: true, 
    completedAt: new Date() 
  }).where(eq(tasks.id, id));

  // Add to history
  await db.insert(taskHistory).values({
    taskId: id,
    title: task.title,
    pointsEarned: task.points,
    category: task.category,
  });

  // Update points
  await updatePoints(task.points, task.category);

  // Check for medal unlocks
  await checkAndUnlockMedals();

  // Update treasure progress
  await updateTreasureProgress(task.points);

  return task;
}

// ===== POINTS HELPERS =====

export async function getPoints() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(pointsSystem).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function initializePoints() {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getPoints();
  if (existing) return existing;

  const result = await db.insert(pointsSystem).values({
    totalPoints: 0,
    dailyPoints: 0,
    weeklyPoints: 0,
    monthlyPoints: 0,
  });

  return result;
}

export async function updatePoints(points: number, category: "daily" | "weekly" | "monthly") {
  const db = await getDb();
  if (!db) return null;

  const current = await getPoints();
  if (!current) {
    await initializePoints();
  }

  const updates: any = { totalPoints: (current?.totalPoints || 0) + points };
  
  if (category === "daily") updates.dailyPoints = (current?.dailyPoints || 0) + points;
  if (category === "weekly") updates.weeklyPoints = (current?.weeklyPoints || 0) + points;
  if (category === "monthly") updates.monthlyPoints = (current?.monthlyPoints || 0) + points;

  return await db.update(pointsSystem).set(updates).where(eq(pointsSystem.id, current?.id || 1));
}

// ===== MEDALS HELPERS =====

export async function getAllMedals() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(medals).orderBy(desc(medals.createdAt));
}

export async function getUnlockedMedals() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(medals).where(eq(medals.isUnlocked, true)).orderBy(desc(medals.unlockedAt));
}

export async function initializeMedals() {
  const db = await getDb();
  if (!db) return null;

  const existing = await getAllMedals();
  if (existing.length > 0) return existing;

  const defaultMedals = [
    {
      name: "Primeiro Passo",
      description: "Complete sua primeira tarefa",
      icon: "🎯",
      condition: "complete_1_task",
    },
    {
      name: "Coletor de Ouro",
      description: "Ganhe 50 pontos",
      icon: "💰",
      condition: "earn_50_points",
    },
    {
      name: "Campeão",
      description: "Ganhe 100 pontos",
      icon: "🏆",
      condition: "earn_100_points",
    },
    {
      name: "Lenda",
      description: "Ganhe 500 pontos",
      icon: "⭐",
      condition: "earn_500_points",
    },
    {
      name: "Mestre das Tarefas",
      description: "Complete 10 tarefas",
      icon: "🎪",
      condition: "complete_10_tasks",
    },
    {
      name: "Semana Perfeita",
      description: "Complete todas as tarefas semanais",
      icon: "📅",
      condition: "complete_all_weekly",
    },
  ];

  for (const medal of defaultMedals) {
    await db.insert(medals).values(medal);
  }

  return defaultMedals;
}

export async function checkAndUnlockMedals() {
  const db = await getDb();
  if (!db) return;

  const points = await getPoints();
  const history = await getTaskHistory();
  const unlockedMedals = await getUnlockedMedals();

  const allMedals = await getAllMedals();

  for (const medal of allMedals) {
    if (medal.isUnlocked) continue;

    let shouldUnlock = false;

    if (medal.condition === "complete_1_task" && history.length >= 1) {
      shouldUnlock = true;
    } else if (medal.condition === "complete_10_tasks" && history.length >= 10) {
      shouldUnlock = true;
    } else if (medal.condition === "earn_50_points" && (points?.totalPoints || 0) >= 50) {
      shouldUnlock = true;
    } else if (medal.condition === "earn_100_points" && (points?.totalPoints || 0) >= 100) {
      shouldUnlock = true;
    } else if (medal.condition === "earn_500_points" && (points?.totalPoints || 0) >= 500) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      await db.update(medals).set({ 
        isUnlocked: true, 
        unlockedAt: new Date() 
      }).where(eq(medals.id, medal.id));

      await db.insert(medalHistory).values({
        medalId: medal.id,
        medalName: medal.name,
      });
    }
  }
}

// ===== TASK HISTORY HELPERS =====

export async function getTaskHistory() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(taskHistory).orderBy(desc(taskHistory.completedAt));
}

export async function getTaskHistoryByCategory(category: "daily" | "weekly" | "monthly") {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(taskHistory).where(eq(taskHistory.category, category)).orderBy(desc(taskHistory.completedAt));
}

// ===== TREASURE PROGRESS HELPERS =====

export async function getTreasureProgress() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(treasureProgress).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function initializeTreasureProgress() {
  const db = await getDb();
  if (!db) return null;

  const existing = await getTreasureProgress();
  if (existing) return existing;

  const result = await db.insert(treasureProgress).values({
    currentStep: 0,
    totalSteps: 100,
    percentage: "0",
  });

  return result;
}

export async function updateTreasureProgress(points: number) {
  const db = await getDb();
  if (!db) return null;

  const current = await getTreasureProgress();
  if (!current) {
    await initializeTreasureProgress();
  }

  const newStep = (current?.currentStep || 0) + Math.floor(points / 10);
  const totalSteps = current?.totalSteps || 100;
  const percentage = Math.min((newStep / totalSteps) * 100, 100);

  return await db.update(treasureProgress).set({
    currentStep: newStep,
    percentage: percentage.toString(),
  }).where(eq(treasureProgress.id, current?.id || 1));
}

// ===== PARENT SETTINGS HELPERS =====

export async function getParentSettings() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(parentSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function initializeParentSettings() {
  const db = await getDb();
  if (!db) return null;

  const existing = await getParentSettings();
  if (existing) return existing;

  const result = await db.insert(parentSettings).values({
    parentPassword: "88441339",
    isAuthenticated: false,
  });

  return result;
}

export async function verifyParentPassword(password: string) {
  const settings = await getParentSettings();
  if (!settings) {
    await initializeParentSettings();
    const newSettings = await getParentSettings();
    return newSettings?.parentPassword === password;
  }
  return settings.parentPassword === password;
}

export async function updateParentPassword(newPassword: string) {
  const db = await getDb();
  if (!db) return null;

  const settings = await getParentSettings();
  if (!settings) {
    await initializeParentSettings();
  }

  return await db.update(parentSettings).set({
    parentPassword: newPassword,
  }).where(eq(parentSettings.id, settings?.id || 1));
}
