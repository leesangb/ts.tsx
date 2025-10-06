/**
 * Options for configuring object comparison behavior.
 */
export type DiffOptions = {
  /** Paths to ignore during comparison (e.g., ["user.password", "metadata.timestamp"]) */
  ignorePaths?: string[];
  /** Types to ignore during comparison */
  ignoreTypes?: Array<'function' | 'symbol' | 'undefined'>;
  /** Custom comparison functions for specific paths. Returns true if values are considered equal. */
  compareWith?: Record<string, (left: unknown, right: unknown) => boolean>;
  /** How to handle circular references: 'ignore' skips them, 'mark' adds a diff entry, 'error' throws */
  circularRefs?: 'ignore' | 'mark' | 'error';
  /** Maximum depth to traverse (default: Infinity) */
  maxDepth?: number;
};

/**
 * Represents a value that was added or deleted.
 */
export type ValueDiff = {
  type: 'added' | 'deleted';
  /** Path to the value as an array (e.g., ["user", "name"]) */
  path: string[];
  /** The value that was added or deleted */
  value: unknown;
};

/**
 * Represents a value that was updated.
 */
export type UpdateDiff = {
  type: 'updated';
  /** Path to the value as an array (e.g., ["user", "name"]) */
  path: string[];
  /** The old value before the update */
  oldValue: unknown;
  /** The new value after the update */
  newValue: unknown;
};

/**
 * Union type representing all possible diff types.
 */
export type Diff = ValueDiff | UpdateDiff;

/**
 * Computes the differences between two objects.
 *
 * Performs a deep comparison of two objects and returns an array of differences.
 * Supports custom comparison logic, circular reference handling, and path filtering.
 *
 * @param left - The original/old object
 * @param right - The new/updated object
 * @param options - Configuration options for the comparison
 * @returns Array of differences between the two objects
 *
 * @example
 * ```ts
 * const oldUser = { name: 'John', age: 30, address: { city: 'NYC' } };
 * const newUser = { name: 'John', age: 31, address: { city: 'LA' } };
 *
 * const diffs = objectDiff(oldUser, newUser);
 * // [
 * //   { type: 'updated', path: ['age'], oldValue: 30, newValue: 31 },
 * //   { type: 'updated', path: ['address', 'city'], oldValue: 'NYC', newValue: 'LA' }
 * // ]
 * ```
 *
 * @example
 * ```ts
 * // With options
 * const diffs = objectDiff(oldUser, newUser, {
 *   ignorePaths: ['metadata.timestamp'],
 *   ignoreTypes: ['function'],
 *   maxDepth: 3,
 *   circularRefs: 'error'
 * });
 * ```
 *
 * @example
 * ```ts
 * // With custom comparator
 * const diffs = objectDiff(oldUser, newUser, {
 *   compareWith: {
 *     'createdAt': (a, b) => {
 *       // Custom date comparison
 *       return new Date(a).getTime() === new Date(b).getTime();
 *     }
 *   }
 * });
 * ```
 */
export const objectDiff = (left: unknown, right: unknown, options: DiffOptions = {}): Diff[] => {
  const {
    ignorePaths = [],
    ignoreTypes = [],
    compareWith = {},
    circularRefs = 'mark',
    maxDepth = Number.POSITIVE_INFINITY,
  } = options;

  if (left === right) return [];

  const diffs: Diff[] = [];
  const visited = new WeakSet();

  const shouldIgnorePath = (path: string[]) => {
    return ignorePaths.some(ignorePath => path.join('.') === ignorePath || path.join('.').startsWith(`${ignorePath}.`));
  };

  const shouldIgnoreType = (value: unknown) => {
    return ignoreTypes.includes(typeof value as any);
  };

  const traverse = (left: unknown, right: unknown, path: string[] = [], depth = 0) => {
    if (depth > maxDepth) return;

    if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) {
      if (left !== right && !shouldIgnorePath(path)) {
        if (right === undefined && left !== undefined) {
          diffs.push({ type: 'deleted', path, value: left });
        } else if (left === undefined && right !== undefined) {
          diffs.push({ type: 'added', path, value: right });
        } else {
          diffs.push({ type: 'updated', path, oldValue: left, newValue: right });
        }
      }
      return;
    }

    const pathStr = path.join('.');
    if (compareWith[pathStr]?.(left, right)) {
      return;
    }

    if (visited.has(left) || visited.has(right)) {
      if (circularRefs === 'error') {
        throw new Error(`Circular reference detected at path: ${path.join('.')}`);
      }
      if (circularRefs === 'mark') {
        diffs.push({
          type: 'updated',
          path,
          oldValue: '[Circular]',
          newValue: '[Circular]',
        });
      }
      return;
    }

    visited.add(left);
    visited.add(right);

    const leftKeys = Object.keys(left as object);
    const rightKeys = Object.keys(right as object);
    const allKeys = [...new Set([...leftKeys, ...rightKeys])];

    for (const key of allKeys) {
      const newPath = [...path, key];
      const leftValue = (left as any)[key];
      const rightValue = (right as any)[key];

      if (!(key in (right as object))) {
        if (!shouldIgnorePath(newPath) && !shouldIgnoreType(leftValue)) {
          diffs.push({ type: 'deleted', path: newPath, value: leftValue });
        }
      } else if (!(key in (left as object))) {
        if (!shouldIgnorePath(newPath) && !shouldIgnoreType(rightValue)) {
          diffs.push({ type: 'added', path: newPath, value: rightValue });
        }
      } else {
        traverse(leftValue, rightValue, newPath, depth + 1);
      }
    }
  };

  traverse(left, right);
  return diffs;
};
