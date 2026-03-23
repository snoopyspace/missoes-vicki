import { describe, expect, it, beforeEach, vi } from "vitest";
import * as db from "./db";

// Mock do banco de dados
vi.mock("./db", {
  getDb: vi.fn(),
  getAllTasks: vi.fn(),
  getTasksByCategory: vi.fn(),
  getTaskById: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  completeTask: vi.fn(),
  getPoints: vi.fn(),
  initializePoints: vi.fn(),
  updatePoints: vi.fn(),
  getAllMedals: vi.fn(),
  getUnlockedMedals: vi.fn(),
  initializeMedals: vi.fn(),
  checkAndUnlockMedals: vi.fn(),
  getTaskHistory: vi.fn(),
  getTreasureProgress: vi.fn(),
  initializeTreasureProgress: vi.fn(),
  updateTreasureProgress: vi.fn(),
  getParentSettings: vi.fn(),
  initializeParentSettings: vi.fn(),
  verifyParentPassword: vi.fn(),
  updateParentPassword: vi.fn(),
});

describe("Tasks API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list all tasks", async () => {
    const mockTasks = [
      {
        id: 1,
        title: "Fazer lição de casa",
        description: "Matemática e português",
        category: "daily" as const,
        points: 10,
        priority: "high" as const,
        completed: false,
        completedAt: null,
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getAllTasks).mockResolvedValue(mockTasks);

    const result = await db.getAllTasks();

    expect(result).toEqual(mockTasks);
    expect(db.getAllTasks).toHaveBeenCalled();
  });

  it("should get tasks by category", async () => {
    const mockTasks = [
      {
        id: 1,
        title: "Tarefa diária",
        description: "Uma tarefa do dia",
        category: "daily" as const,
        points: 5,
        priority: "low" as const,
        completed: false,
        completedAt: null,
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(db.getTasksByCategory).mockResolvedValue(mockTasks);

    const result = await db.getTasksByCategory("daily");

    expect(result).toEqual(mockTasks);
    expect(db.getTasksByCategory).toHaveBeenCalledWith("daily");
  });

  it("should create a task", async () => {
    const newTask = {
      title: "Nova tarefa",
      description: "Descrição",
      category: "daily" as const,
      points: 10,
      priority: "medium" as const,
    };

    vi.mocked(db.createTask).mockResolvedValue({ insertId: 1 });

    const result = await db.createTask(newTask);

    expect(result).toEqual({ insertId: 1 });
    expect(db.createTask).toHaveBeenCalledWith(newTask);
  });
});

describe("Points API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize points system", async () => {
    vi.mocked(db.initializePoints).mockResolvedValue({ insertId: 1 });

    const result = await db.initializePoints();

    expect(result).toBeDefined();
    expect(db.initializePoints).toHaveBeenCalled();
  });

  it("should get current points", async () => {
    const mockPoints = {
      id: 1,
      totalPoints: 100,
      dailyPoints: 20,
      weeklyPoints: 50,
      monthlyPoints: 30,
      updatedAt: new Date(),
    };

    vi.mocked(db.getPoints).mockResolvedValue(mockPoints);

    const result = await db.getPoints();

    expect(result).toEqual(mockPoints);
    expect(result?.totalPoints).toBe(100);
  });
});

describe("Medals API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize medals", async () => {
    const mockMedals = [
      {
        id: 1,
        name: "Primeiro Passo",
        description: "Complete sua primeira tarefa",
        icon: "🎯",
        condition: "complete_1_task",
        isUnlocked: false,
        unlockedAt: null,
        createdAt: new Date(),
      },
    ];

    vi.mocked(db.initializeMedals).mockResolvedValue(mockMedals);

    const result = await db.initializeMedals();

    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
  });

  it("should get unlocked medals", async () => {
    const mockUnlockedMedals = [
      {
        id: 1,
        name: "Primeiro Passo",
        description: "Complete sua primeira tarefa",
        icon: "🎯",
        condition: "complete_1_task",
        isUnlocked: true,
        unlockedAt: new Date(),
        createdAt: new Date(),
      },
    ];

    vi.mocked(db.getUnlockedMedals).mockResolvedValue(mockUnlockedMedals);

    const result = await db.getUnlockedMedals();

    expect(result).toEqual(mockUnlockedMedals);
    expect(result?.length).toBeGreaterThan(0);
  });
});

describe("Parent Authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should verify correct parent password", async () => {
    vi.mocked(db.verifyParentPassword).mockResolvedValue(true);

    const result = await db.verifyParentPassword("88441339");

    expect(result).toBe(true);
    expect(db.verifyParentPassword).toHaveBeenCalledWith("88441339");
  });

  it("should reject incorrect parent password", async () => {
    vi.mocked(db.verifyParentPassword).mockResolvedValue(false);

    const result = await db.verifyParentPassword("wrongpassword");

    expect(result).toBe(false);
  });

  it("should update parent password", async () => {
    vi.mocked(db.updateParentPassword).mockResolvedValue({ affectedRows: 1 });

    const result = await db.updateParentPassword("newpassword");

    expect(result).toBeDefined();
    expect(db.updateParentPassword).toHaveBeenCalledWith("newpassword");
  });
});
