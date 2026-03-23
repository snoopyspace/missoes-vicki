import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tarefas da Vicki
 * Armazena todas as tarefas com suas propriedades e status
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["daily", "weekly", "monthly"]).notNull(),
  points: int("points").notNull().default(10),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),
  dueDate: timestamp("dueDate"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Histórico de tarefas completadas
 * Rastreia quando cada tarefa foi concluída e quantos pontos foram ganhos
 */
export const taskHistory = mysqlTable("taskHistory", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  pointsEarned: int("pointsEarned").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  category: mysqlEnum("category", ["daily", "weekly", "monthly"]).notNull(),
});

export type TaskHistory = typeof taskHistory.$inferSelect;
export type InsertTaskHistory = typeof taskHistory.$inferInsert;

/**
 * Sistema de pontos
 * Armazena o total de pontos da Vicki
 */
export const pointsSystem = mysqlTable("pointsSystem", {
  id: int("id").autoincrement().primaryKey(),
  totalPoints: int("totalPoints").default(0).notNull(),
  dailyPoints: int("dailyPoints").default(0).notNull(),
  weeklyPoints: int("weeklyPoints").default(0).notNull(),
  monthlyPoints: int("monthlyPoints").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PointsSystem = typeof pointsSystem.$inferSelect;
export type InsertPointsSystem = typeof pointsSystem.$inferInsert;

/**
 * Medalhas e Insígnias
 * Define todas as medalhas disponíveis no sistema
 */
export const medals = mysqlTable("medals", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }).notNull(),
  condition: varchar("condition", { length: 255 }).notNull(), // ex: "complete_5_tasks", "earn_100_points"
  unlockedAt: timestamp("unlockedAt"),
  isUnlocked: boolean("isUnlocked").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Medal = typeof medals.$inferSelect;
export type InsertMedal = typeof medals.$inferInsert;

/**
 * Histórico de medalhas desbloqueadas
 * Rastreia quando cada medalha foi conquistada
 */
export const medalHistory = mysqlTable("medalHistory", {
  id: int("id").autoincrement().primaryKey(),
  medalId: int("medalId").notNull(),
  medalName: varchar("medalName", { length: 255 }).notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type MedalHistory = typeof medalHistory.$inferSelect;
export type InsertMedalHistory = typeof medalHistory.$inferInsert;

/**
 * Progresso do Tesouro
 * Armazena o progresso da animação do tabuleiro do tesouro
 */
export const treasureProgress = mysqlTable("treasureProgress", {
  id: int("id").autoincrement().primaryKey(),
  currentStep: int("currentStep").default(0).notNull(),
  totalSteps: int("totalSteps").default(100).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TreasureProgress = typeof treasureProgress.$inferSelect;
export type InsertTreasureProgress = typeof treasureProgress.$inferInsert;

/**
 * Configurações do Painel dos Pais
 * Armazena configurações e senha do painel administrativo
 */
export const parentSettings = mysqlTable("parentSettings", {
  id: int("id").autoincrement().primaryKey(),
  parentPassword: varchar("parentPassword", { length: 255 }).notNull(),
  isAuthenticated: boolean("isAuthenticated").default(false),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParentSettings = typeof parentSettings.$inferSelect;
export type InsertParentSettings = typeof parentSettings.$inferInsert;
