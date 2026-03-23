import { describe, expect, it, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Parent Authentication", () => {
  beforeAll(async () => {
    // Inicializar configurações dos pais antes dos testes
    await db.initializeParentSettings();
  });

  it("should verify correct parent password", async () => {
    const result = await db.verifyParentPassword("88441339");
    expect(result).toBe(true);
  });

  it("should reject incorrect parent password", async () => {
    const result = await db.verifyParentPassword("wrongpassword");
    expect(result).toBe(false);
  });

  it("should reject empty password", async () => {
    const result = await db.verifyParentPassword("");
    expect(result).toBe(false);
  });

  it("should get parent settings", async () => {
    const settings = await db.getParentSettings();
    expect(settings).toBeDefined();
    expect(settings?.parentPassword).toBe("88441339");
  });

  it("should update parent password", async () => {
    const newPassword = "newpass123";
    await db.updateParentPassword(newPassword);
    
    const result = await db.verifyParentPassword(newPassword);
    expect(result).toBe(true);
    
    // Restaurar senha original
    await db.updateParentPassword("88441339");
  });
});
