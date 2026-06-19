import { describe, expect, it } from "vitest";
import { createEngineName } from "../src/index.js";

/**
 * Smoke test for the initial TypeScript/Vitest setup.
 *
 * This test confirms that:
 * - source files can be imported from src/
 * - Vitest can discover and run test files
 * - the basic test pipeline works before adding core engine logic
 */
describe("createEngineName", () => {
  it("returns the engine name", () => {
    expect(createEngineName()).toBe("CRDT-Collaboration-Engine");
  });
});


