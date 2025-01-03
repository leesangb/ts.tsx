export type Diff =
  | {
      type: 'added' | 'deleted';
      path: string;
      value: unknown;
    }
  | {
      type: 'updated';
      path: string;
      left: unknown;
      right: unknown;
    };

export const objectDiff = (left: object, right: object): Diff[] => {
  if (left === right) return [];
  if (!left && right) return [{ type: 'added', path: '', value: right }];
  if (left && !right) return [{ type: 'deleted', path: '', value: left }];
  if (!left && !right) return [];

  const diffs: Diff[] = [];
  const visited = new Set<unknown>();

  const traverse = (left: object, right: object, path = '') => {
    visited.add(left);
    visited.add(right);

    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

    const getCurrentPath = (key: string) => (path ? (Array.isArray(left) ? `${path}[${key}]` : `${path}.${key}`) : key);

    for (const key of keys) {
      const currentPath = getCurrentPath(key);
      const l = getValue(left, key);
      const r = getValue(right, key);
      if (isNonNullableObject(l) && isNonNullableObject(r) && !visited.has(l) && !visited.has(r)) {
        if (haveSameConstructor(l, r) || haveAtLeastOneSameKey(l, r) || Array.isArray(l) || Array.isArray(r)) {
          traverse(l, r, currentPath);
        } else {
          diffs.push({ type: 'updated', path: currentPath, left: l, right: r });
        }
      } else if (hasOwnProperty(left, key) && !hasOwnProperty(right, key)) {
        if (isFunction(l) && !isGetter(left, key)) {
          break;
        }
        diffs.push({ type: 'deleted', path: currentPath, value: l });
      } else if (!hasOwnProperty(left, key) && hasOwnProperty(right, key)) {
        if (isFunction(r) && !isGetter(right, key)) {
          break;
        }
        diffs.push({ type: 'added', path: currentPath, value: r });
      } else if (l !== r && !isFunction(l) && !isFunction(r)) {
        diffs.push({
          type: 'updated',
          path: currentPath,
          left: l,
          right: r,
        });
      }
    }
  };
  traverse(left, right);
  return diffs;
};

const isNonNullableObject = (value: unknown): value is object => typeof value === 'object' && !!value;
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
const hasOwnProperty = <const T extends string>(obj: unknown, key: T): obj is { [key in T]: unknown } =>
  Object.prototype.hasOwnProperty.call(obj, key);

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const isFunction = (value: unknown): value is (...args: any[]) => any => typeof value === 'function';
const haveSameConstructor = (left: unknown, right: unknown) =>
  hasOwnProperty(left, 'constructor') &&
  isFunction(left.constructor) &&
  hasOwnProperty(right, 'constructor') &&
  isFunction(right.constructor) &&
  left.constructor === right.constructor;

const haveAtLeastOneSameKey = (left: object, right: object) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.some(key => rightKeys.includes(key));
};

const getValue = (obj: object, key: string) => (hasOwnProperty(obj, key) ? obj[key] : undefined);

const isGetter = (obj: object, key: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  return descriptor?.get;
};
