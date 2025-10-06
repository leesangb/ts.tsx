import { describe, expect, test } from 'vitest';
import { HashSet } from './hash-set';

describe('HashSet', () => {
  describe('Basic operations', () => {
    test('can create an empty HashSet', () => {
      const set = new HashSet<string>();
      expect(set.size).toBe(0);
    });

    test('can add elements', () => {
      const set = new HashSet<string>();
      set.add('item1');
      expect(set.has('item1')).toBe(true);
      expect(set.size).toBe(1);
    });

    test('only stores one element when duplicates are added', () => {
      const set = new HashSet<string>();
      set.add('item1');
      set.add('item1');
      expect(set.has('item1')).toBe(true);
      expect(set.size).toBe(1);
    });

    test('can check if an element exists', () => {
      const set = new HashSet<string>();
      expect(set.has('item1')).toBe(false);
      set.add('item1');
      expect(set.has('item1')).toBe(true);
    });

    test('can delete elements', () => {
      const set = new HashSet<string>();
      set.add('item1');
      expect(set.delete('item1')).toBe(true);
      expect(set.has('item1')).toBe(false);
      expect(set.size).toBe(0);
    });

    test('returns false when deleting a non-existent element', () => {
      const set = new HashSet<string>();
      expect(set.delete('nonexistent')).toBe(false);
    });

    test('can clear the HashSet', () => {
      const set = new HashSet<string>();
      set.add('item1');
      set.add('item2');
      set.clear();
      expect(set.size).toBe(0);
      expect(set.has('item1')).toBe(false);
      expect(set.has('item2')).toBe(false);
    });

    test('objects are distinguished by reference without a hash function', () => {
      const set = new HashSet<{ id: number }>();
      const obj1 = { id: 1 };
      const obj2 = { id: 1 };

      set.add(obj1);
      set.add(obj2);

      expect(set.has(obj1)).toBe(true);
      expect(set.has(obj2)).toBe(true);
      expect(set.size).toBe(2);
    });
  });

  describe('Iterators and collection methods', () => {
    test('can get all values with values() method', () => {
      const set = new HashSet<string>();
      set.add('item1');
      set.add('item2');
      set.add('item3');

      const values = Array.from(set.values());
      expect(values).toContain('item1');
      expect(values).toContain('item2');
      expect(values).toContain('item3');
      expect(values).toHaveLength(3);
    });

    test('can iterate with Symbol.iterator', () => {
      const set = new HashSet<string>();
      set.add('item1');
      set.add('item2');
      set.add('item3');

      const values = Array.from(set);
      expect(values).toContain('item1');
      expect(values).toContain('item2');
      expect(values).toContain('item3');
      expect(values).toHaveLength(3);
    });

    test('can iterate with for...of loop', () => {
      const set = new HashSet<string>();
      set.add('item1');
      set.add('item2');
      set.add('item3');

      const collected: string[] = [];
      for (const value of set) {
        collected.push(value);
      }

      expect(collected).toContain('item1');
      expect(collected).toContain('item2');
      expect(collected).toContain('item3');
      expect(collected).toHaveLength(3);
    });
  });

  describe('Custom hash function', () => {
    test('can use a custom hash function', () => {
      const set = new HashSet<{ id: number; name: string }>({
        getHash: obj => obj.id,
      });

      const obj1 = { id: 1, name: 'Alice' };
      const obj2 = { id: 2, name: 'Bob' };
      const obj3 = { id: 1, name: 'Alice Updated' };

      set.add(obj1);
      set.add(obj2);
      set.add(obj3);

      expect(set.has(obj1)).toBe(true);
      expect(set.has(obj2)).toBe(true);
      expect(set.has(obj3)).toBe(true);
      expect(set.size).toBe(2);
    });

    test('can use numbers as hash values', () => {
      const set = new HashSet<number>({
        getHash: num => num % 10,
      });

      set.add(1);
      set.add(11);
      set.add(2);
      set.add(21);

      expect(set.has(1)).toBe(true);
      expect(set.has(11)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(21)).toBe(true);
      expect(set.size).toBe(2);
    });

    test('can use strings as hash values', () => {
      const set = new HashSet<{ x: number; y: number }>({
        getHash: point => `${point.x},${point.y}`,
      });

      const point1 = { x: 1, y: 2 };
      const point2 = { x: 3, y: 4 };
      const point3 = { x: 1, y: 2 };

      set.add(point1);
      set.add(point2);
      set.add(point3);

      expect(set.has(point1)).toBe(true);
      expect(set.has(point2)).toBe(true);
      expect(set.has(point3)).toBe(true);
      expect(set.size).toBe(2);
    });
  });
});
