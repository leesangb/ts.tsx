import { describe, expect, test } from 'vitest';
import { HashMap } from './hash-map';

describe('HashMap', () => {
  describe('Basic operations', () => {
    test('can create an empty HashMap', () => {
      const map = new HashMap<string, number>();
      expect(map.size).toBe(0);
    });

    test('can set key-value pairs', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      expect(map.get('key1')).toBe(100);
      expect(map.size).toBe(1);
    });

    test('can update the value of an existing key', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      map.set('key1', 200);
      expect(map.get('key1')).toBe(200);
      expect(map.size).toBe(1);
    });

    test('can check if a key exists', () => {
      const map = new HashMap<string, number>();
      expect(map.has('key1')).toBe(false);
      map.set('key1', 100);
      expect(map.has('key1')).toBe(true);
    });

    test('can delete key-value pairs', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      expect(map.delete('key1')).toBe(true);
      expect(map.has('key1')).toBe(false);
      expect(map.size).toBe(0);
    });

    test('returns false when deleting a non-existent key', () => {
      const map = new HashMap<string, number>();
      expect(map.delete('nonexistent')).toBe(false);
    });

    test('can clear the HashMap', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      map.set('key2', 200);
      map.clear();
      expect(map.size).toBe(0);
      expect(map.has('key1')).toBe(false);
      expect(map.has('key2')).toBe(false);
    });

    test('object keys are distinguished by reference without a hash function', () => {
      const objMap = new HashMap<{ id: number }, string>();
      const obj1 = { id: 1 };
      const obj2 = { id: 1 };

      objMap.set(obj1, 'value1');
      objMap.set(obj2, 'value2');

      expect(objMap.get(obj1)).toBe('value1');
      expect(objMap.get(obj2)).toBe('value2');
      expect(objMap.size).toBe(2);
    });
  });

  describe('Iterators and collection methods', () => {
    test('can get all keys with keys() method', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      map.set('key2', 200);
      map.set('key3', 300);

      const keys = Array.from(map.keys());
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
      expect(keys).toHaveLength(3);
    });

    test('can get all values with values() method', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      map.set('key2', 200);
      map.set('key3', 300);

      const values = Array.from(map.values());
      expect(values).toContain(100);
      expect(values).toContain(200);
      expect(values).toContain(300);
      expect(values).toHaveLength(3);
    });

    test('can get all key-value pairs with entries() method', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      map.set('key2', 200);
      map.set('key3', 300);

      const entries = Array.from(map.entries());
      expect(entries).toContainEqual(['key1', 100]);
      expect(entries).toContainEqual(['key2', 200]);
      expect(entries).toContainEqual(['key3', 300]);
      expect(entries).toHaveLength(3);
    });

    test('can iterate with Symbol.iterator', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      map.set('key2', 200);
      map.set('key3', 300);

      for (const [key, value] of map) {
        expect(map.get(key)).toBe(value);
      }
    });

    test('can iterate through all entries with forEach method', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      map.set('key2', 200);
      map.set('key3', 300);

      const visited: Array<[string, number]> = [];
      map.forEach((value, key) => {
        visited.push([key, value]);
      });

      expect(visited).toContainEqual(['key1', 100]);
      expect(visited).toContainEqual(['key2', 200]);
      expect(visited).toContainEqual(['key3', 300]);
      expect(visited).toHaveLength(3);
    });

    test('can use thisArg in forEach method', () => {
      const map = new HashMap<string, number>();
      map.set('key1', 100);
      map.set('key2', 200);
      map.set('key3', 300);

      const context = { count: 0 };
      map.forEach(function (this: typeof context) {
        this.count++;
      }, context);

      expect(context.count).toBe(3);
    });
  });

  describe('Custom hash function', () => {
    test('can use a custom hash function', () => {
      const customMap = new HashMap<{ id: number; name: string }, string>({
        getHash: obj => obj.id,
      });

      const obj1 = { id: 1, name: 'Alice' };
      const obj2 = { id: 2, name: 'Bob' };
      const obj3 = { id: 1, name: 'Alice Updated' };

      customMap.set(obj1, 'value1');
      customMap.set(obj2, 'value2');
      customMap.set(obj3, 'value3');

      expect(customMap.get(obj1)).toBe('value3');
      expect(customMap.get(obj2)).toBe('value2');
      expect(customMap.size).toBe(2);
    });

    test('can use strings as hash values', () => {
      const customMap = new HashMap<string, number>({
        getHash: str => str.toUpperCase(),
      });

      customMap.set('hello', 100);
      customMap.set('HELLO', 200);

      expect(customMap.get('hello')).toBe(200);
      expect(customMap.get('HELLO')).toBe(200);
      expect(customMap.size).toBe(1);
    });

    test('can use numbers as hash values', () => {
      const customMap = new HashMap<number, string>({
        getHash: num => num % 10,
      });

      customMap.set(1, 'one');
      customMap.set(11, 'eleven');
      customMap.set(2, 'two');

      expect(customMap.get(1)).toBe('eleven');
      expect(customMap.get(11)).toBe('eleven');
      expect(customMap.get(2)).toBe('two');
      expect(customMap.size).toBe(2);
    });
  });
});
