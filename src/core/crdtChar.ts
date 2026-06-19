import type { Identifier } from "./identifier";

/**
 * Represents a single character stored inside the CRDT document.
 *
 * A collaborative editor cannot store characters as plain strings only.
 * Each character needs metadata so every replica can agree on its position,
 * visibility, and ordering during concurrent edits.
 *
 * Example:
 * {
 *   value: "H",
 *   id: {
 *     position: [128],
 *     siteId: "userA"
 *   },
 *   deleted: false
 * }
 */
export interface CRDTChar {
  /**
   * The actual character value typed by the user.
   *
   * Examples: "H", "a", " ", ".", "!"
   */
  value: string;

  /**
   * Stable CRDT identifier for this character.
   *
   * The identifier determines where the character belongs in the document,
   * independent of the character's current array index.
   */
  id: Identifier;

  /**
   * Tombstone flag used for delete operations.
   *
   * Deleted characters are hidden from the user interface but kept internally
   * so remote or offline operations can still reference their identifiers.
   */
  deleted: boolean;
}

/**
 * Creates a new visible CRDT character.
 *
 * New characters always start with deleted set to false because they should
 * appear in the editor immediately after insertion.
 */
export function createCRDTChar(value: string, id: Identifier): CRDTChar {
  return {
    value,
    id,
    deleted: false,
  };
}

/**
 * Determines whether a CRDT character should be rendered in the editor.
 *
 * Tombstoned characters remain in the internal CRDT sequence for merge safety,
 * but they should not appear in the visible document text.
 */
export function isVisibleChar(char: CRDTChar): boolean {
  return !char.deleted;
}