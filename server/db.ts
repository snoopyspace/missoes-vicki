import { eq, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tasks, taskHistory, pointsSystem, medals, medalHistory, treasureProgress, parentSettings, comboStreak, pushNotifications, weeklyChallenges, rewards, redeemHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
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

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    return undefined;
  }
}

// ===== TASKS HELPERS =====

export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tasks).orderBy(tasks.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get all tasks:", error);
    return [];
  }
}

export async function getTasksByCategory(category: "daily" | "weekly" | "monthly") {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(tasks).where(eq(tasks.category, category)).orderBy(tasks.priority);
  } catch (error) {
    console.error("[Database] Failed to get tasks by category:", error);
    return [];
  }
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get task by id:", error);
    return null;
  }
}

export async function createTask(data: {
  title: string;
  description?: string;
  category: "daily" | "weekly" | "monthly";
  points: number;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    await db.insert(tasks).values({
      title: data.title,
      description: data.description || null,
      category: data.category,
      points: data.points,
      priority: data.priority,
      dueDate: data.dueDate || null,
      completed: false,
      completedAt: null,
    });
    
    // Return the created task by fetching the latest
    const allTasks = await getAllTasks();
    return allTasks[allTasks.length - 1] || null;
  } catch (error) {
    console.error("[Database] Failed to create task:", error);
    throw error;
  }
}

export async function updateTask(id: number, data: Partial<{
  title: string;
  description: string;
  category: "daily" | "weekly" | "monthly";
  points: number;
  priority: "low" | "medium" | "high";
  dueDate: Date;
}>) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    
    await db.update(tasks).set(updateData).where(eq(tasks.id, id));
    return await getTaskById(id);
  } catch (error) {
    console.error("[Database] Failed to update task:", error);
    throw error;
  }
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    return await db.delete(tasks).where(eq(tasks.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete task:", error);
    throw error;
  }
}

export async function completeTask(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  try {
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
  } catch (error) {
    console.error("[Database] Failed to complete task:", error);
    throw error;
  }
}

// ===== POINTS HELPERS =====

export async function getPoints() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(pointsSystem).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get points:", error);
    return null;
  }
}

export async function initializePoints() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const existing = await getPoints();
    if (existing) return existing;

    const result = await db.insert(pointsSystem).values({
      totalPoints: 0,
      dailyPoints: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to initialize points:", error);
    throw error;
  }
}

export async function updatePoints(points: number, category: "daily" | "weekly" | "monthly") {
  const db = await getDb();
  if (!db) return null;

  try {
    const current = await getPoints();
    if (!current) {
      await initializePoints();
    }

    const updates: any = { totalPoints: (current?.totalPoints || 0) + points };
    
    if (category === "daily") updates.dailyPoints = (current?.dailyPoints || 0) + points;
    if (category === "weekly") updates.weeklyPoints = (current?.weeklyPoints || 0) + points;
    if (category === "monthly") updates.monthlyPoints = (current?.monthlyPoints || 0) + points;

    return await db.update(pointsSystem).set(updates).where(eq(pointsSystem.id, current?.id || 1));
  } catch (error) {
    console.error("[Database] Failed to update points:", error);
    throw error;
  }
}

// ===== MEDALS HELPERS =====

export async function getAllMedals() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(medals).orderBy(medals.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get medals:", error);
    return [];
  }
}

export async function checkAndUnlockMedals() {
  const db = await getDb();
  if (!db) return;

  try {
    const points = await getPoints();
    const history = await getTaskHistory();
    
    if (!points || !history) return;

    // Medal conditions
    const conditions = [
      { id: 1, name: "Primeiro Passo", check: () => history.length >= 1 },
      { id: 2, name: "Dedicado", check: () => history.length >= 5 },
      { id: 3, name: "Campeão", check: () => history.length >= 10 },
      { id: 4, name: "Pontuação 100", check: () => points.totalPoints >= 100 },
      { id: 5, name: "Pontuação 500", check: () => points.totalPoints >= 500 },
      { id: 6, name: "Lendário", check: () => points.totalPoints >= 1000 },
    ];

    for (const condition of conditions) {
      if (condition.check()) {
        const existing = await db.select().from(medalHistory)
          .where(eq(medalHistory.medalId, condition.id))
          .limit(1);
        
        if (existing.length === 0) {
          await db.insert(medalHistory).values({
            medalId: condition.id,
            medalName: condition.name,
            unlockedAt: new Date(),
          });
        }
      }
    }
  } catch (error) {
    console.error("[Database] Failed to check and unlock medals:", error);
  }
}

export async function initializeMedals() {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getAllMedals();
    if (existing.length > 0) return existing;

    const medalData = [
      { name: "Primeiro Passo", description: "Complete sua primeira tarefa", icon: "🎯", condition: "complete_1_task" },
      { name: "Dedicado", description: "Complete 5 tarefas", icon: "💪", condition: "complete_5_tasks" },
      { name: "Campeão", description: "Complete 10 tarefas", icon: "🏆", condition: "complete_10_tasks" },
      { name: "Pontuação 100", description: "Ganhe 100 pontos", icon: "⭐", condition: "earn_100_points" },
      { name: "Pontuação 500", description: "Ganhe 500 pontos", icon: "✨", condition: "earn_500_points" },
      { name: "Lendário", description: "Ganhe 1000 pontos", icon: "👑", condition: "earn_1000_points" },
    ];

    for (const medal of medalData) {
      await db.insert(medals).values(medal);
    }

    return await getAllMedals();
  } catch (error) {
    console.error("[Database] Failed to initialize medals:", error);
    throw error;
  }
}

export async function getUnlockedMedals() {
  const db = await getDb();
  if (!db) return [];

  try {
    const unlockedIds = await db.select({ medalId: medalHistory.medalId })
      .from(medalHistory);
    
    const allMedals = await getAllMedals();
    return allMedals.filter(m => unlockedIds.some(u => u.medalId === m.id));
  } catch (error) {
    console.error("[Database] Failed to get unlocked medals:", error);
    return [];
  }
}

// ===== TASK HISTORY HELPERS =====

export async function getTaskHistory() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(taskHistory).orderBy(taskHistory.completedAt);
  } catch (error) {
    console.error("[Database] Failed to get task history:", error);
    return [];
  }
}

export async function getTaskHistoryByCategory(category: "daily" | "weekly" | "monthly") {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(taskHistory)
      .where(eq(taskHistory.category, category))
      .orderBy(taskHistory.completedAt);
  } catch (error) {
    console.error("[Database] Failed to get task history by category:", error);
    return [];
  }
}

// ===== TREASURE PROGRESS HELPERS =====

export async function getTreasureProgress() {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(treasureProgress).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get treasure progress:", error);
    return null;
  }
}

export async function initializeTreasureProgress() {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getTreasureProgress();
    if (existing) return existing;

    const result = await db.insert(treasureProgress).values({
      currentStep: 0,
      totalSteps: 100,
      percentage: "0.00",
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to initialize treasure progress:", error);
    throw error;
  }
}

export async function updateTreasureProgress(points: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const current = await getTreasureProgress();
    if (!current) {
      await initializeTreasureProgress();
    }

    const currentPercentage = parseFloat(current?.percentage?.toString() || "0");
    const newPercentage = Math.min(currentPercentage + (points / 1000) * 100, 100);
    const newStep = Math.floor((newPercentage / 100) * 100);

    return await db.update(treasureProgress)
      .set({ 
        percentage: newPercentage.toString(),
        currentStep: newStep,
      })
      .where(eq(treasureProgress.id, current?.id || 1));
  } catch (error) {
    console.error("[Database] Failed to update treasure progress:", error);
    throw error;
  }
}

// ===== PARENT SETTINGS HELPERS =====

export async function getParentSettings() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.select().from(parentSettings).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get parent settings:", error);
    return null;
  }
}

export async function initializeParentSettings() {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getParentSettings();
    if (existing) return existing;

    const result = await db.insert(parentSettings).values({
      parentPassword: "88441339",
      isAuthenticated: false,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to initialize parent settings:", error);
    throw error;
  }
}

export async function verifyParentPassword(password: string) {
  try {
    const settings = await getParentSettings();
    if (!settings) {
      await initializeParentSettings();
      const newSettings = await getParentSettings();
      return newSettings?.parentPassword === password;
    }
    return settings.parentPassword === password;
  } catch (error) {
    console.error("[Database] Failed to verify parent password:", error);
    return false;
  }
}

export async function updateParentPassword(newPassword: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const settings = await getParentSettings();
    if (!settings) {
      await initializeParentSettings();
    }

    return await db.update(parentSettings)
      .set({ parentPassword: newPassword })
      .where(eq(parentSettings.id, settings?.id || 1));
  } catch (error) {
    console.error("[Database] Failed to update parent password:", error);
    throw error;
  }
}

// ===== DASHBOARD STATS =====

export async function getDashboardStats() {
  try {
    const points = await getPoints();
    const history = await getTaskHistory();
    const medals = await getUnlockedMedals();
    const treasure = await getTreasureProgress();
    const allTasks = await getAllTasks();

    const completedTasks = allTasks.filter(t => t.completed).length;
    const totalTasks = allTasks.length;

    return {
      totalPoints: points?.totalPoints || 0,
      dailyPoints: points?.dailyPoints || 0,
      weeklyPoints: points?.weeklyPoints || 0,
      monthlyPoints: points?.monthlyPoints || 0,
      completedTasks,
      totalTasks,
      unlockedMedals: medals.length,
      totalMedals: 6,
      treasureProgress: (treasure?.percentage ? parseFloat(treasure.percentage.toString()) : 0).toFixed(1),
      medals: medals.map(m => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
      })),
      recentTasks: history.slice(-5).reverse(),
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    return {
      totalPoints: 0,
      dailyPoints: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      completedTasks: 0,
      totalTasks: 0,
      unlockedMedals: 0,
      totalMedals: 6,
      treasureProgress: "0",
      medals: [],
      recentTasks: [],
    };
  }
}


// ===== COMBO STREAK HELPERS =====

export async function getComboStreak() {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(comboStreak).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get combo streak:", error);
    return null;
  }
}

export async function initializeComboStreak() {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getComboStreak();
    if (existing) return existing;

    const result = await db.insert(comboStreak).values({
      currentStreak: 0,
      maxStreak: 0,
      multiplier: "1.0",
      lastTaskDate: null,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to initialize combo streak:", error);
    throw error;
  }
}

export async function updateComboStreak(taskCompleted: boolean) {
  const db = await getDb();
  if (!db) return null;

  try {
    let current = await getComboStreak();
    if (!current) {
      await initializeComboStreak();
      current = await getComboStreak();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDate = current?.lastTaskDate ? new Date(current.lastTaskDate) : null;
    lastDate?.setHours(0, 0, 0, 0);

    let newStreak = current?.currentStreak || 0;
    let newMultiplier = 1.0;

    if (taskCompleted) {
      // Check if it's a new day
      if (!lastDate || lastDate.getTime() < today.getTime()) {
        newStreak = (current?.currentStreak || 0) + 1;
      }

      // Calculate multiplier based on streak
      if (newStreak >= 10) newMultiplier = 5.0;
      else if (newStreak >= 5) newMultiplier = 3.0;
      else if (newStreak >= 2) newMultiplier = 2.0;
      else newMultiplier = 1.0;
    } else {
      // Reset streak if task not completed
      newStreak = 0;
      newMultiplier = 1.0;
    }

    const maxStreak = Math.max(current?.maxStreak || 0, newStreak);

    return await db.update(comboStreak).set({
      currentStreak: newStreak,
      maxStreak: maxStreak,
      multiplier: newMultiplier.toString(),
      lastTaskDate: new Date(),
    }).where(eq(comboStreak.id, current?.id || 1));
  } catch (error) {
    console.error("[Database] Failed to update combo streak:", error);
    throw error;
  }
}

export async function getComboMultiplier() {
  try {
    const combo = await getComboStreak();
    return combo ? parseFloat(combo.multiplier?.toString() || "1.0") : 1.0;
  } catch (error) {
    console.error("[Database] Failed to get combo multiplier:", error);
    return 1.0;
  }
}

// ===== PUSH NOTIFICATIONS HELPERS =====

export async function getPushNotifications() {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(pushNotifications).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get push notifications:", error);
    return null;
  }
}

export async function initializePushNotifications() {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getPushNotifications();
    if (existing) return existing;

    const result = await db.insert(pushNotifications).values({
      isEnabled: true,
      reminderTime: "09:00",
      lastReminderSent: null,
      subscriptionEndpoint: null,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to initialize push notifications:", error);
    throw error;
  }
}

export async function updatePushNotificationSubscription(endpoint: string, isEnabled: boolean) {
  const db = await getDb();
  if (!db) return null;

  try {
    let current = await getPushNotifications();
    if (!current) {
      await initializePushNotifications();
      current = await getPushNotifications();
    }

    return await db.update(pushNotifications).set({
      subscriptionEndpoint: endpoint,
      isEnabled: isEnabled,
    }).where(eq(pushNotifications.id, current?.id || 1));
  } catch (error) {
    console.error("[Database] Failed to update push notification subscription:", error);
    throw error;
  }
}

export async function updatePushNotificationTime(reminderTime: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    let current = await getPushNotifications();
    if (!current) {
      await initializePushNotifications();
      current = await getPushNotifications();
    }

    return await db.update(pushNotifications).set({
      reminderTime: reminderTime,
    }).where(eq(pushNotifications.id, current?.id || 1));
  } catch (error) {
    console.error("[Database] Failed to update push notification time:", error);
    throw error;
  }
}


// ===== WEEKLY CHALLENGES HELPERS =====

export async function getWeeklyChallenges() {
  const db = await getDb();
  if (!db) return [];

  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return await db.select().from(weeklyChallenges)
      .where(and(
        gte(weeklyChallenges.weekStartDate, weekStart),
        lte(weeklyChallenges.weekEndDate, weekEnd)
      ));
  } catch (error) {
    console.error("[Database] Failed to get weekly challenges:", error);
    return [];
  }
}

export async function initializeWeeklyChallenges() {
  const db = await getDb();
  if (!db) return null;

  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Check if challenges already exist for this week
    const existing = await getWeeklyChallenges();
    if (existing.length > 0) return existing;

    // Create default challenges
    const challenges = [
      {
        title: "Guerreiro da Semana",
        description: "Complete 5 tarefas nesta semana",
        icon: "⚔️",
        targetCount: 5,
        bonusMultiplier: "1.5",
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
      },
      {
        title: "Campeão Imparável",
        description: "Complete 10 tarefas nesta semana",
        icon: "🏆",
        targetCount: 10,
        bonusMultiplier: "2.0",
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
      },
      {
        title: "Lenda da Semana",
        description: "Complete 20 tarefas nesta semana",
        icon: "👑",
        targetCount: 20,
        bonusMultiplier: "3.0",
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
      },
    ];

    for (const challenge of challenges) {
      await db.insert(weeklyChallenges).values(challenge);
    }

    return await getWeeklyChallenges();
  } catch (error) {
    console.error("[Database] Failed to initialize weekly challenges:", error);
    throw error;
  }
}

export async function updateWeeklyChallengeProgress(challengeId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const challenge = await db.select().from(weeklyChallenges)
      .where(eq(weeklyChallenges.id, challengeId))
      .limit(1);

    if (challenge.length === 0) return null;

    const current = challenge[0];
    const newProgress = (current.currentProgress || 0) + 1;
    const isCompleted = newProgress >= current.targetCount;

    return await db.update(weeklyChallenges).set({
      currentProgress: newProgress,
      isCompleted: isCompleted,
      completedAt: isCompleted ? new Date() : null,
    }).where(eq(weeklyChallenges.id, challengeId));
  } catch (error) {
    console.error("[Database] Failed to update weekly challenge progress:", error);
    throw error;
  }
}

// ===== REWARDS HELPERS =====

export async function getAllRewards() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(rewards)
      .where(eq(rewards.isActive, true))
      .orderBy(rewards.pointsCost);
  } catch (error) {
    console.error("[Database] Failed to get all rewards:", error);
    return [];
  }
}

export async function getRewardsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(rewards)
      .where(and(
        eq(rewards.category, category),
        eq(rewards.isActive, true)
      ))
      .orderBy(rewards.pointsCost);
  } catch (error) {
    console.error("[Database] Failed to get rewards by category:", error);
    return [];
  }
}

export async function initializeDefaultRewards() {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getAllRewards();
    if (existing.length > 0) return existing;

    const defaultRewards = [
      {
        title: "Dia Livre de Tarefas",
        description: "Pule um dia sem fazer tarefas",
        icon: "🎉",
        category: "experience",
        pointsCost: 100,
        quantity: 0,
      },
      {
        title: "Filme a Escolher",
        description: "Escolha um filme para assistir",
        icon: "🎬",
        category: "experience",
        pointsCost: 150,
        quantity: 0,
      },
      {
        title: "Sorvete Especial",
        description: "Ganhe um sorvete especial",
        icon: "🍦",
        category: "physical",
        pointsCost: 200,
        quantity: 0,
      },
      {
        title: "Jogo Novo",
        description: "Escolha um jogo novo para jogar",
        icon: "🎮",
        category: "digital",
        pointsCost: 300,
        quantity: 0,
      },
      {
        title: "Passeio Especial",
        description: "Passeio ao local de sua escolha",
        icon: "🎢",
        category: "experience",
        pointsCost: 500,
        quantity: 0,
      },
    ];

    for (const reward of defaultRewards) {
      await db.insert(rewards).values(reward);
    }

    return await getAllRewards();
  } catch (error) {
    console.error("[Database] Failed to initialize default rewards:", error);
    throw error;
  }
}

export async function redeemReward(rewardId: number, pointsAvailable: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const rewardData = await db.select().from(rewards)
      .where(eq(rewards.id, rewardId))
      .limit(1);

    if (rewardData.length === 0) {
      throw new Error("Reward not found");
    }

    const reward = rewardData[0];

    if (pointsAvailable < reward.pointsCost) {
      throw new Error("Insufficient points");
    }

    // Generate redeem code
    const redeemCode = `VICKI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create redeem history entry
    const result = await db.insert(redeemHistory).values({
      rewardId: rewardId,
      rewardTitle: reward.title,
      pointsSpent: reward.pointsCost,
      status: "pending",
      redeemCode: redeemCode,
    });

    // Deduct points
    const points = await getPoints();
    if (points) {
      await db.update(pointsSystem).set({
        totalPoints: Math.max(0, (points.totalPoints || 0) - reward.pointsCost),
      }).where(eq(pointsSystem.id, points.id));
    }

    return {
      success: true,
      redeemCode: redeemCode,
      reward: reward.title,
      pointsSpent: reward.pointsCost,
    };
  } catch (error) {
    console.error("[Database] Failed to redeem reward:", error);
    throw error;
  }
}

export async function getRedeemHistory() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(redeemHistory)
      .orderBy(redeemHistory.redeemedAt);
  } catch (error) {
    console.error("[Database] Failed to get redeem history:", error);
    return [];
  }
}


// ===== ADMIN MANAGEMENT HELPERS =====

export async function createReward(reward: any) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(rewards).values(reward);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create reward:", error);
    throw error;
  }
}

export async function updateReward(rewardId: number, updates: any) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.update(rewards).set(updates).where(eq(rewards.id, rewardId));
  } catch (error) {
    console.error("[Database] Failed to update reward:", error);
    throw error;
  }
}

export async function deleteReward(rewardId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.delete(rewards).where(eq(rewards.id, rewardId));
  } catch (error) {
    console.error("[Database] Failed to delete reward:", error);
    throw error;
  }
}

export async function createWeeklyChallenge(challenge: any) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(weeklyChallenges).values(challenge);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create weekly challenge:", error);
    throw error;
  }
}

export async function updateWeeklyChallenge(challengeId: number, updates: any) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.update(weeklyChallenges).set(updates).where(eq(weeklyChallenges.id, challengeId));
  } catch (error) {
    console.error("[Database] Failed to update weekly challenge:", error);
    throw error;
  }
}

export async function deleteWeeklyChallenge(challengeId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.delete(weeklyChallenges).where(eq(weeklyChallenges.id, challengeId));
  } catch (error) {
    console.error("[Database] Failed to delete weekly challenge:", error);
    throw error;
  }
}

export async function updateTaskPoints(taskId: number, newPoints: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.update(tasks).set({
      points: newPoints,
    }).where(eq(tasks.id, taskId));
  } catch (error) {
    console.error("[Database] Failed to update task points:", error);
    throw error;
  }
}

export async function toggleTaskActive(taskId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.update(tasks).set({
      completed: isActive,
    }).where(eq(tasks.id, taskId));
  } catch (error) {
    console.error("[Database] Failed to toggle task active:", error);
    throw error;
  }
}

export async function resetUserProgress() {
  const db = await getDb();
  if (!db) return null;

  try {
    // Reset points
    const points = await getPoints();
    if (points) {
      await db.update(pointsSystem).set({
        totalPoints: 0,
        dailyPoints: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
      }).where(eq(pointsSystem.id, points.id));
    }

    // Reset combo
    const combo = await getComboStreak();
    if (combo) {
      await db.update(comboStreak).set({
        currentStreak: 0,
        multiplier: "1.0",
      }).where(eq(comboStreak.id, combo.id));
    }

    // Reset treasure
    const treasure = await getTreasureProgress();
    if (treasure) {
      await db.update(treasureProgress).set({
        currentStep: 0,
        percentage: "0",
      }).where(eq(treasureProgress.id, treasure.id));
    }

    // Mark all tasks as incomplete
    await db.update(tasks).set({
      completed: false,
      completedAt: null,
    });

    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to reset user progress:", error);
    throw error;
  }
}

export async function getDetailedAnalytics() {
  const db = await getDb();
  if (!db) return null;

  try {
    const allTasks = await getAllTasks();
    const history = await getTaskHistory();
    const medals = await getUnlockedMedals();
    const points = await getPoints();
    const combo = await getComboStreak();

    const completedTasks = allTasks.filter(t => t.completed).length;
    const totalTasks = allTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const dailyAverage = history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + (h.pointsEarned || 0), 0) / Math.max(1, history.length))
      : 0;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      totalPoints: points?.totalPoints || 0,
      dailyAverage,
      unlockedMedals: medals.length,
      currentCombo: combo?.currentStreak || 0,
      maxCombo: combo?.maxStreak || 0,
      totalTasksCompleted: history.length,
    };
  } catch (error) {
    console.error("[Database] Failed to get detailed analytics:", error);
    return null;
  }
}


// ===== MEDAL MANAGEMENT HELPERS =====

export async function createCustomMedal(medal: any) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(medals).values({
      name: medal.name,
      description: medal.description,
      icon: medal.icon,
      condition: medal.condition,
      isUnlocked: false,
      createdAt: new Date(),
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create custom medal:", error);
    throw error;
  }
}

export async function updateCustomMedal(medalId: number, updates: any) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.update(medals).set(updates).where(eq(medals.id, medalId));
  } catch (error) {
    console.error("[Database] Failed to update custom medal:", error);
    throw error;
  }
}

export async function deleteCustomMedal(medalId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    return await db.delete(medals).where(eq(medals.id, medalId));
  } catch (error) {
    console.error("[Database] Failed to delete custom medal:", error);
    throw error;
  }
}



export async function getMedalProgress() {
  const db = await getDb();
  if (!db) return [];

  try {
    const allMedals = await db.select().from(medals);
    const medalHistoryList = await db.select().from(medalHistory);
    const stats = await getDetailedAnalytics();

    return allMedals.map((medal) => {
      const isUnlocked = medalHistoryList.some(m => m.medalId === medal.id);
      let progress = 0;

      if (medal.condition.includes("tasks")) {
        const target = parseInt(medal.condition.match(/\d+/)?.[0] || "1");
        progress = Math.min(100, ((stats?.totalTasksCompleted || 0) / target) * 100);
      } else if (medal.condition.includes("points")) {
        const target = parseInt(medal.condition.match(/\d+/)?.[0] || "1");
        progress = Math.min(100, ((stats?.totalPoints || 0) / target) * 100);
      } else if (medal.condition.includes("combo")) {
        const target = parseInt(medal.condition.match(/\d+/)?.[0] || "1");
        progress = Math.min(100, ((stats?.currentCombo || 0) / target) * 100);
      }

      return {
        ...medal,
        isUnlocked,
        progress: Math.round(progress),
      };
    });
  } catch (error) {
    console.error("[Database] Failed to get medal progress:", error);
    return [];
  }
}
