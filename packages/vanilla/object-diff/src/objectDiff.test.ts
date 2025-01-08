import { describe, expect, it, test } from 'vitest';
import { objectDiff } from './index';

describe('objectDiff', () => {
  describe('should return an empty array', () => {
    test('when both objects are empty', () => {
      const left = {};
      const right = {};

      const result = objectDiff(left, right);

      expect(result).toEqual([]);
    });

    test('when both objects are the same', () => {
      const left = { prop1: 'value1', prop2: 'value2' };
      const right = { prop1: 'value1', prop2: 'value2' };

      const result = objectDiff(left, right);

      expect(result).toEqual([]);
    });

    test.each([
      [undefined, undefined],
      [null, null],
    ])('when left is %s, right is %s', (left, right) => {
      // biome-ignore lint/suspicious/noExplicitAny: for testing
      const result = objectDiff(left as any, right as any);

      expect(result).toEqual([]);
    });

    test('when left object has a getter and right object has a primitive', () => {
      const left = {
        get prop() {
          return 'value';
        },
      };
      const right = { prop: 'value' };

      const result = objectDiff(left, right);

      expect(result).toEqual([]);
    });
  });

  describe('should return an array with "added" diff', () => {
    test('when right object has a new property', () => {
      const left = { prop1: 'value1' };
      const right = { prop1: 'value1', prop2: 'value2' };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'added', path: ['prop2'], value: 'value2' }]);
    });

    test('when left object has a missing property and right object has undefined', () => {
      const left = {};
      const right = { prop2: undefined };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'added', path: ['prop2'], value: undefined }]);
    });

    test('when left object has a missing property and right object has null', () => {
      const left = {};
      const right = { prop2: null };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'added', path: ['prop2'], value: null }]);
    });

    test('when left has missing property and right has getter', () => {
      const left = {};
      const right = {
        get prop() {
          return 'value';
        },
      };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'added', path: ['prop'], value: 'value' }]);
    });
  });

  describe('should return an array with "deleted" diff', () => {
    test('when left object has a missing property', () => {
      const left = { prop1: 'value1' };
      const right = {};

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'deleted', path: ['prop1'], value: 'value1' }]);
    });

    test('when right object has a missing property and left object has undefined', () => {
      const left = { prop2: undefined };
      const right = {};

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'deleted', path: ['prop2'], value: undefined }]);
    });

    test('when right object has a missing property and left object has null', () => {
      const left = { prop2: null };
      const right = {};

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'deleted', path: ['prop2'], value: null }]);
    });

    test('when left has value with getters and right has missing property', () => {
      const left = {
        get prop() {
          return 'value';
        },
      };
      const right = {};

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'deleted', path: ['prop'], value: 'value' }]);
    });
  });

  describe('should return an array with "updated" diff', () => {
    test('when left object is null and right object is not null', () => {
      // biome-ignore lint/suspicious/noExplicitAny: for testing
      const left = null as any;
      const right = { prop1: 'value1' };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'updated', path: [], oldValue: left, newValue: right }]);
    });

    test('when right object is null and left object is not null', () => {
      const left = { prop1: 'value1' };
      // biome-ignore lint/suspicious/noExplicitAny: for testing
      const right = null as any;

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'updated', path: [], oldValue: left, newValue: right }]);
    });

    test('when left object has a different value', () => {
      const left = { prop1: 'value1', prop2: 'value2' };
      const right = { prop1: 'value1', prop2: 'value3' };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'updated', path: ['prop2'], oldValue: 'value2', newValue: 'value3' }]);
    });

    test('when there are multiple changes in the objects', () => {
      const left = { name: 'John', age: 30 };
      const right = { name: 'Jane', age: 25 };

      const result = objectDiff(left, right);

      expect(result).toEqual([
        { type: 'updated', path: ['name'], oldValue: 'John', newValue: 'Jane' },
        { type: 'updated', path: ['age'], oldValue: 30, newValue: 25 },
      ]);
    });

    test('when nested objects have different values', () => {
      const left = { person: { name: 'John', age: 30 } };
      const right = { person: { name: 'Jane', age: 25 } };

      const result = objectDiff(left, right);

      expect(result).toEqual([
        { type: 'updated', path: ['person', 'name'], oldValue: 'John', newValue: 'Jane' },
        { type: 'updated', path: ['person', 'age'], oldValue: 30, newValue: 25 },
      ]);
    });

    test('when arrays have different values', () => {
      const left = { arr: [1, 2, 3] };
      const right = { arr: [1, 2, 4] };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'updated', path: ['arr', '2'], oldValue: 3, newValue: 4 }]);
    });

    test.each([
      [null, ''],
      [null, 0],
      [null, false],
    ])('when properties changed from `%s` to `%s`', (left, right) => {
      const result = objectDiff({ prop1: left }, { prop1: right });

      expect(result).toEqual([{ type: 'updated', path: ['prop1'], oldValue: left, newValue: right }]);
    });

    test.skip('when left object and right object have a different constructor', () => {
      const left = { prop: new Date() };
      const right = { prop: /(?:)/ };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'updated', path: ['prop'], oldValue: left.prop, newValue: right.prop }]);
    });
  });

  it('should return an array of diffs when objects have circular references', () => {
    const obj1: Record<string, unknown> = { prop: null };
    const obj2: Record<string, unknown> = { prop: obj1 };
    obj1.prop = obj2;

    const result = objectDiff(obj1, obj2);

    expect(result).toEqual([{ type: 'updated', path: ['prop'], oldValue: '[Circular]', newValue: '[Circular]' }]);
  });

  describe('when objects with different constructors', () => {
    class Left {
      constructor(
        public prop: string,
        public prop2: string,
      ) {}
    }
    class Right {
      constructor(
        public prop: string,
        public prop2: string,
      ) {}
    }

    it('should return an empty array when both objects have same keys', () => {
      const left = new Left('value', 'value2');
      const right = new Right('value', 'value2');

      const result = objectDiff(left, right, {
        ignoreTypes: ['function'],
      });

      expect(result).toEqual([]);
    });

    it('should return an array with "updated" diff when both objects have different keys', () => {
      const left = new Left('value', 'value2');
      const right = new Right('value', 'value3');

      const result = objectDiff(left, right);

      expect(result).toEqual([
        {
          type: 'updated',
          path: ['prop2'],
          oldValue: 'value2',
          newValue: 'value3',
        },
      ]);
    });

    it('should return an empty array when objects have same shape', () => {
      const left = { prop: 'value', prop2: 'value2' };
      const right = new Right('value', 'value2');

      const result = objectDiff(left, right);

      expect(result).toEqual([]);
    });

    it('should return an array with "updated" diff when left property is an object and right property is a primitive', () => {
      const left = { prop: { prop: 'value' }, prop2: 'value2' };
      const right = new Right('value', 'value2');

      const result = objectDiff(left, right);

      expect(result).toEqual([
        {
          type: 'updated',
          path: ['prop'],
          oldValue: { prop: 'value' },
          newValue: 'value',
        },
      ]);
    });

    it('should return an array with "updated" diff when left is a class object and right is an object with "constructor" property', () => {
      const left = new Left('value', 'value2');
      const right = { prop: 'value', prop2: 'value2', constructor: 'value' };

      const result = objectDiff(left, right);

      expect(result).toEqual([
        {
          type: 'updated',
          path: ['constructor'],
          oldValue: Left,
          newValue: 'value',
        },
      ]);
    });
  });

  describe('when objects have functions (!getter)', () => {
    it('should return an empty array when both objects have same keys', () => {
      const left = { prop: () => {} };
      const right = { prop: () => {} };

      const result = objectDiff(left, right);

      expect(result).toEqual([{ type: 'updated', path: ['prop'], oldValue: left.prop, newValue: right.prop }]);
    });

    it('should return an empty array when both objects have different keys', () => {
      const left = { prop: () => {} };
      const right = { prop2: () => {} };

      const result = objectDiff(left, right);

      expect(result).toEqual([
        { type: 'deleted', path: ['prop'], value: left.prop },
        { type: 'added', path: ['prop2'], value: right.prop2 },
      ]);
    });
  });

  describe('when objects have arrays', () => {
    it('should return an array with "updated" values when left and right have same length but different values', () => {
      const left = { prop: [1, 2, 3] };
      const right = { prop: [3, 4, 5] };

      const result = objectDiff(left, right);

      expect(result).toEqual([
        { path: ['prop', '0'], oldValue: 1, newValue: 3, type: 'updated' },
        { path: ['prop', '1'], oldValue: 2, newValue: 4, type: 'updated' },
        { path: ['prop', '2'], oldValue: 3, newValue: 5, type: 'updated' },
      ]);
    });

    it('should return an array with deleted keys', () => {
      const left = { prop: [1, 2, 3] };
      const right = { prop: [1] };

      const result = objectDiff(left, right);

      expect(result).toEqual([
        { path: ['prop', '1'], value: 2, type: 'deleted' },
        { path: ['prop', '2'], value: 3, type: 'deleted' },
      ]);
    });

    it('should return an array with added keys', () => {
      const left = { prop: [1] };
      const right = { prop: [1, 2, 3] };

      const result = objectDiff(left, right);

      expect(result).toEqual([
        { path: ['prop', '1'], value: 2, type: 'added' },
        { path: ['prop', '2'], value: 3, type: 'added' },
      ]);
    });
  });
});
