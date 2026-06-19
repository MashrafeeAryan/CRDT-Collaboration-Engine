import { describe, expect, it } from "vitest";
import {
  compareIdentifiers,
  createIdentifierBetween,
  generatePositionBetween,
  type Identifier,
} from "../src/core/identifier";

/**
 * Unit tests for the CRDT identifier system.
 *
 * These tests protect the core ordering guarantees of the editor:
 * - new characters can be inserted before, after, or between existing positions
 * - identifiers can grow deeper when no numeric space exists at the current level
 * - concurrent inserts with the same position resolve deterministically by siteId
 */
describe("identifier", () => {
  it("generates the first position in the middle of the range", () => {
    const position = generatePositionBetween(null, null);

    expect(position).toEqual([128]);
  });

  it("generates a position after a previous position when next is null", () => {
    const position = generatePositionBetween([128], null);

    expect(position).toEqual([192]);
  });

  it("generates a position before a next position when previous is null", () => {
    const position = generatePositionBetween(null, [128]);

    expect(position).toEqual([64]);
  });

  it("generates a midpoint between two positions", () => {
    const position = generatePositionBetween([128], [192]);

    expect(position).toEqual([160]);
  });

  it("creates a deeper position when there is no room at the current depth", () => {
    /**
     * There is no integer between 128 and 129.
     * The CRDT must preserve the shared prefix and create a deeper coordinate.
     */
    const position = generatePositionBetween([128], [129]);

    expect(position).toEqual([128, 128]);
  });

  it("compares identifiers by numeric position", () => {
    const a: Identifier = {
      position: [128],
      siteId: "userA",
    };

    const b: Identifier = {
      position: [192],
      siteId: "userA",
    };

    expect(compareIdentifiers(a, b)).toBe(-1);
    expect(compareIdentifiers(b, a)).toBe(1);
  });

  it("uses siteId as a tie-breaker when positions are equal", () => {
    /**
     * Concurrent replicas can generate the same numeric position.
     * siteId gives every replica the same deterministic ordering rule.
     */
    const a: Identifier = {
      position: [128],
      siteId: "userA",
    };

    const b: Identifier = {
      position: [128],
      siteId: "userB",
    };

    expect(compareIdentifiers(a, b)).toBe(-1);
    expect(compareIdentifiers(b, a)).toBe(1);
  });

  it("returns 0 when identifiers are identical", () => {
    const a: Identifier = {
      position: [128],
      siteId: "userA",
    };

    const b: Identifier = {
      position: [128],
      siteId: "userA",
    };

    expect(compareIdentifiers(a, b)).toBe(0);
  });

  it("creates a complete identifier between two neighboring identifiers", () => {
    const previous: Identifier = {
      position: [128],
      siteId: "userA",
    };

    const next: Identifier = {
      position: [192],
      siteId: "userA",
    };

    const newIdentifier = createIdentifierBetween(previous, next, "userB");

    expect(newIdentifier).toEqual({
      position: [160],
      siteId: "userB",
    });
  });
});