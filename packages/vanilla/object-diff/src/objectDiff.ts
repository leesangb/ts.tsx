export type DiffOptions = {
  // Ignore specific paths
  ignorePaths?: string[];
  // Ignore specific types
  ignoreTypes?: Array<'function' | 'symbol' | 'undefined'>;
  // Custom comparison function for specific paths
  compareWith?: Record<string, (left: unknown, right: unknown) => boolean>;
  // How to handle circular references
  circularRefs?: 'ignore' | 'mark' | 'error';
  // Maximum depth to traverse
  maxDepth?: number;
};

export type ValueDiff = {
  type: 'added' | 'deleted';
  path: string[]; // Array-based path for better type safety
  value: unknown;
};

export type UpdateDiff = {
  type: 'updated';
  path: string[];
  oldValue: unknown;
  newValue: unknown;
};

export type Diff = ValueDiff | UpdateDiff;

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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return ignoreTypes.includes(typeof value as any);
  };

  const traverse = (left: unknown, right: unknown, path: string[] = [], depth = 0) => {
    // Check max depth
    if (depth > maxDepth) return;

    // Handle primitive values (including null and undefined)
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

    // Check for custom comparator
    const pathStr = path.join('.');
    if (compareWith[pathStr]?.(left, right)) {
      return;
    }

    // Handle circular references
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

    // Get all keys from both objects
    const leftKeys = Object.keys(left as object);
    const rightKeys = Object.keys(right as object);
    const allKeys = [...new Set([...leftKeys, ...rightKeys])];

    // Compare each key
    for (const key of allKeys) {
      const newPath = [...path, key];
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const leftValue = (left as any)[key];
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
