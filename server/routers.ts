import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ===== TASKS ROUTERS =====
  tasks: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTasks();
    }),

    listByCategory: publicProcedure
      .input(z.enum(["daily", "weekly", "monthly"]))
      .query(async ({ input }) => {
        return await db.getTasksByCategory(input);
      }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.getTaskById(input);
      }),

    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(["daily", "weekly", "monthly"]),
        points: z.number().min(1).default(10),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createTask(input);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["daily", "weekly", "monthly"]).optional(),
        points: z.number().min(1).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateTask(id, updates);
      }),

    delete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return await db.deleteTask(input);
      }),

    complete: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return await db.completeTask(input);
      }),
  }),

  // ===== POINTS ROUTERS =====
  points: router({
    get: publicProcedure.query(async () => {
      const points = await db.getPoints();
      if (!points) {
        await db.initializePoints();
        return await db.getPoints();
      }
      return points;
    }),

    initialize: publicProcedure.mutation(async () => {
      return await db.initializePoints();
    }),
  }),

  // ===== MEDALS ROUTERS =====
  medals: router({
    list: publicProcedure.query(async () => {
      const medals = await db.getAllMedals();
      if (medals.length === 0) {
        await db.initializeMedals();
        return await db.getAllMedals();
      }
      return medals;
    }),

    getUnlocked: publicProcedure.query(async () => {
      return await db.getUnlockedMedals();
    }),

    initialize: publicProcedure.mutation(async () => {
      return await db.initializeMedals();
    }),

    checkAndUnlock: publicProcedure.mutation(async () => {
      return await db.checkAndUnlockMedals();
    }),

    getProgress: publicProcedure.query(async () => {
      return await db.getMedalProgress();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string(),
        icon: z.string(),
        condition: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.createCustomMedal(input);
      }),

    update: protectedProcedure
      .input(z.object({
        medalId: z.number(),
        updates: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          icon: z.string().optional(),
          condition: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.updateCustomMedal(input.medalId, input.updates);
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.deleteCustomMedal(input);
      }),
  }),

  // ===== TASK HISTORY ROUTERS =====
  history: router({
    list: publicProcedure.query(async () => {
      return await db.getTaskHistory();
    }),

    listByCategory: publicProcedure
      .input(z.enum(["daily", "weekly", "monthly"]))
      .query(async ({ input }) => {
        return await db.getTaskHistoryByCategory(input);
      }),
  }),

  // ===== TREASURE PROGRESS ROUTERS =====
  treasure: router({
    getProgress: publicProcedure.query(async () => {
      const progress = await db.getTreasureProgress();
      if (!progress) {
        await db.initializeTreasureProgress();
        return await db.getTreasureProgress();
      }
      return progress;
    }),

    initialize: publicProcedure.mutation(async () => {
      return await db.initializeTreasureProgress();
    }),
  }),

  // ===== PARENT AUTHENTICATION ROUTERS =====
  parent: router({
    verifyPassword: publicProcedure
      .input(z.string())
      .mutation(async ({ input }) => {
        const isValid = await db.verifyParentPassword(input);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha incorreta",
          });
        }
        return { success: true };
      }),

    getSettings: publicProcedure.query(async () => {
      const settings = await db.getParentSettings();
      if (!settings) {
        await db.initializeParentSettings();
        return await db.getParentSettings();
      }
      return settings;
    }),

    updatePassword: publicProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string(),
      }))
      .mutation(async ({ input }) => {
        const isValid = await db.verifyParentPassword(input.currentPassword);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Senha atual incorreta",
          });
        }
        await db.updateParentPassword(input.newPassword);
        return { success: true };
      }),
  }),

  // ===== DASHBOARD STATS ROUTERS =====
  stats: router({
    getDashboard: publicProcedure.query(async () => {
      const points = await db.getPoints();
      const medals = await db.getUnlockedMedals();
      const treasure = await db.getTreasureProgress();
      const taskHistory = await db.getTaskHistory();
      const allTasks = await db.getAllTasks();

      return {
        totalPoints: points?.totalPoints || 0,
        dailyPoints: points?.dailyPoints || 0,
        weeklyPoints: points?.weeklyPoints || 0,
        monthlyPoints: points?.monthlyPoints || 0,
        unlockedMedals: medals.length,
        totalMedals: (await db.getAllMedals()).length,
        treasureProgress: treasure?.percentage || "0",
        completedTasks: taskHistory.length,
        totalTasks: allTasks.length,
        medals: medals,
        recentTasks: taskHistory.slice(0, 5),
      };
    }),
  }),

  // ===== COMBO STREAK ROUTERS =====
  combo: router({
    getStreak: publicProcedure.query(async () => {
      const combo = await db.getComboStreak();
      if (!combo) {
        await db.initializeComboStreak();
        return await db.getComboStreak();
      }
      return combo;
    }),

    getMultiplier: publicProcedure.query(async () => {
      return await db.getComboMultiplier();
    }),
  }),

  // ===== PUSH NOTIFICATIONS ROUTERS =====
  notifications: router({
    getSettings: publicProcedure.query(async () => {
      const settings = await db.getPushNotifications();
      if (!settings) {
        await db.initializePushNotifications();
        return await db.getPushNotifications();
      }
      return settings;
    }),

    subscribe: publicProcedure
      .input(z.object({
        endpoint: z.string(),
        isEnabled: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        return await db.updatePushNotificationSubscription(input.endpoint, input.isEnabled);
      }),

    updateReminderTime: publicProcedure
      .input(z.string())
      .mutation(async ({ input }) => {
        return await db.updatePushNotificationTime(input);
      }),
  }),

  // ===== WEEKLY CHALLENGES ROUTERS =====
  challenges: router({
    getWeekly: publicProcedure.query(async () => {
      let challenges = await db.getWeeklyChallenges();
      if (challenges.length === 0) {
        challenges = await db.initializeWeeklyChallenges() || [];
      }
      return challenges;
    }),

    updateProgress: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return await db.updateWeeklyChallengeProgress(input);
      }),
  }),

  // ===== REWARDS ROUTERS =====
  rewards: router({
    getAll: publicProcedure.query(async () => {
      let rewards = await db.getAllRewards();
      if (rewards.length === 0) {
        rewards = await db.initializeDefaultRewards() || [];
      }
      return rewards;
    }),

    getByCategory: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await db.getRewardsByCategory(input);
      }),

    redeem: publicProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const points = await db.getPoints();
        if (!points) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Pontos não encontrados",
          });
        }
        return await db.redeemReward(input, points.totalPoints || 0);
      }),

    getHistory: publicProcedure.query(async () => {
      return await db.getRedeemHistory();
    }),
  }),

  // ===== ADMIN MANAGEMENT ROUTERS =====
  admin: router({
    // Task Management
    updateTaskPoints: protectedProcedure
      .input(z.object({ taskId: z.number(), points: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.updateTaskPoints(input.taskId, input.points);
      }),

    toggleTaskActive: protectedProcedure
      .input(z.object({ taskId: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.toggleTaskActive(input.taskId, input.isActive);
      }),

    // Reward Management
    createReward: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string(),
        category: z.string(),
        pointsCost: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.createReward(input);
      }),

    updateReward: protectedProcedure
      .input(z.object({
        rewardId: z.number(),
        updates: z.any(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.updateReward(input.rewardId, input.updates);
      }),

    deleteReward: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.deleteReward(input);
      }),

    // Challenge Management
    createChallenge: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string(),
        targetCount: z.number(),
        bonusMultiplier: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return await db.createWeeklyChallenge({
          ...input,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
        });
      }),

    updateChallenge: protectedProcedure
      .input(z.object({
        challengeId: z.number(),
        updates: z.any(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.updateWeeklyChallenge(input.challengeId, input.updates);
      }),

    deleteChallenge: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.deleteWeeklyChallenge(input);
      }),

    // User Management
    resetProgress: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.resetUserProgress();
      }),

    getAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return await db.getDetailedAnalytics();
      }),
  }),
});

export type AppRouter = typeof appRouter;
