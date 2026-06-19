/**
 * Fractional coordinate identifiers for the CRDT text sequence.
 *
 * Each character in the document receives a stable position that does not
 * depend on its current array index. This allows replicas to merge concurrent
 * edits deterministically, even when operations arrive in different orders.
 */

export type Position = number[];

/**
 * Unique identifier for a character in the CRDT document.
 *
 * The position determines where the character belongs in the sequence.
 * The siteId acts as a deterministic tie-breaker when two replicas generate
 * the same numeric position concurrently.
 */
export interface Identifier {
  position: Position;
  siteId: string;
}

/**
 * Compares two CRDT identifiers in document order.
 *
 * Returns:
 * - -1 if identifier a should come before identifier b
 * -  1 if identifier a should come after identifier b
 * -  0 if both identifiers are identical
 *
 * Positions are compared lexicographically. If the numeric positions are equal,
 * siteId is used as a stable tie-breaker to guarantee deterministic ordering
 * across all replicas.
 */
export function compareIdentifiers(a: Identifier, b: Identifier): number {
  const maxLength = Math.max(a.position.length, b.position.length);

  for (let i = 0; i < maxLength; i++) {
    const aValue = a.position[i] ?? 0;
    const bValue = b.position[i] ?? 0;

    if (aValue < bValue) {
      return -1;
    }

    if (aValue > bValue) {
      return 1;
    }
  }

  if (a.siteId < b.siteId) {
    return -1;
  }

  if (a.siteId > b.siteId) {
    return 1;
  }

  return 0;
}

/**
 * Generates a new fractional position between two existing positions.
 *
 * If there is enough numeric space at the current depth, the function chooses
 * the midpoint. If there is no space, it preserves the shared prefix and moves
 * one level deeper in the position array.
 *
 * This avoids renumbering existing characters and allows inserts to happen
 * anywhere in the document while keeping identifiers deterministic.
 */
export function generatePositionBetween(
  previous: Position | null,
  next: Position | null
): Position {
  const base = 256;
  const min = 0;
  const max = base;

  const newPosition: Position = [];
  let depth = 0;

  while (true) {
    const previousValue = previous?.[depth] ?? min;
    const nextValue = next?.[depth] ?? max;

    if (nextValue - previousValue > 1) {
      const midpoint = Math.floor((previousValue + nextValue) / 2);
      newPosition.push(midpoint);
      return newPosition;
    }

    newPosition.push(previousValue);
    depth++;
  }
}

/**
 * Creates a complete CRDT identifier between two neighboring identifiers.
 *
 * This helper extracts the numeric positions from the neighboring identifiers,
 * generates a new position between them, and attaches the local replica's siteId.
 */
export function createIdentifierBetween(
  previous: Identifier | null,
  next: Identifier | null,
  siteId: string
): Identifier {
  return {
    position: generatePositionBetween(
      previous?.position ?? null,
      next?.position ?? null
    ),
    siteId,
  };
}