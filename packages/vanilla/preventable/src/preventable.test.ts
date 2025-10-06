import { describe, expect, test, vi } from 'vitest';
import { preventable } from './preventable';

describe('preventable', () => {
  describe('basic behavior', () => {
    test('handlers are executed before the original function', () => {
      const mock = vi.fn();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          e.preventDefault();
          handler1();
        },
        handler2,
      ]);

      preventableMock();

      expect(handler1).toBeCalled();
      expect(handler2).toBeCalled();
      expect(mock).not.toBeCalled();
    });

    test('preventDefault prevents the original function from executing', () => {
      const mock = vi.fn();
      const overriden = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          e.preventDefault();
          overriden();
        },
      ]);

      preventableMock();

      expect(mock).not.toBeCalled();
      expect(overriden).toBeCalled();
    });

    test('only the original function is executed when there are no handlers', () => {
      const mock = vi.fn();
      const preventableMock = preventable(mock, []);

      preventableMock();

      expect(mock).toBeCalled();
    });

    test('original function is executed when preventDefault is not called', () => {
      const mock = vi.fn();
      const handler = vi.fn();
      const preventableMock = preventable(mock, [handler]);

      preventableMock();

      expect(handler).toBeCalled();
      expect(mock).toBeCalled();
    });
  });

  describe('parameter passing', () => {
    test('parameters are correctly passed to the original function', () => {
      const mock = vi.fn();
      const preventableMock = preventable(mock, []);

      preventableMock('arg1', 'arg2', 123);

      expect(mock).toBeCalledWith('arg1', 'arg2', 123);
    });

    test('handler can access parameters via event.params', () => {
      const mock = vi.fn();
      const handler = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          expect(e.params).toEqual(['arg1', 'arg2', 123]);
          handler();
        },
      ]);

      preventableMock('arg1', 'arg2', 123);

      expect(handler).toBeCalled();
    });

    test('original function can be called via event.default()', () => {
      const mock = vi.fn();
      const handler = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          e.default('custom1', 'custom2');
          handler();
        },
      ]);

      preventableMock('original1', 'original2');

      expect(handler).toBeCalled();
      expect(mock).toBeCalledWith('custom1', 'custom2');
    });
  });

  describe('multiple handler processing', () => {
    test('multiple handlers are executed in order', () => {
      const mock = vi.fn();
      const executionOrder: string[] = [];
      const preventableMock = preventable(mock, [
        () => {
          executionOrder.push('handler1');
        },
        () => {
          executionOrder.push('handler2');
        },
        () => {
          executionOrder.push('handler3');
        },
      ]);

      preventableMock();

      expect(executionOrder).toEqual(['handler1', 'handler2', 'handler3']);
      expect(mock).toBeCalled();
    });

    test('remaining handlers still execute even when preventDefault is called in a middle handler', () => {
      const mock = vi.fn();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      const preventableMock = preventable(mock, [
        handler1,
        e => {
          e.preventDefault();
          handler2();
        },
        handler3,
      ]);

      preventableMock();

      expect(handler1).toBeCalled();
      expect(handler2).toBeCalled();
      expect(handler3).toBeCalled();
      expect(mock).not.toBeCalled();
    });

    test('remaining handlers execute but original function does not when preventDefault is called in the first handler', () => {
      const mock = vi.fn();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          e.preventDefault();
          handler1();
        },
        handler2,
      ]);

      preventableMock();

      expect(handler1).toBeCalled();
      expect(handler2).toBeCalled();
      expect(mock).not.toBeCalled();
    });
  });

  describe('defaultPrevented state', () => {
    test('defaultPrevented is false before calling preventDefault', () => {
      const mock = vi.fn();
      const handler = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          expect(e.defaultPrevented).toBe(false);
          handler();
        },
      ]);

      preventableMock();
    });

    test('defaultPrevented is true after calling preventDefault', () => {
      const mock = vi.fn();
      const handler = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          e.preventDefault();
          expect(e.defaultPrevented).toBe(true);
          handler();
        },
      ]);

      preventableMock();
    });

    test('defaultPrevented remains true even when preventDefault is called multiple times', () => {
      const mock = vi.fn();
      const handler = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          e.preventDefault();
          e.preventDefault();
          e.preventDefault();
          expect(e.defaultPrevented).toBe(true);
          handler();
        },
      ]);

      preventableMock();
    });
  });

  describe('async function handling', () => {
    test('Promise-returning functions are handled correctly', async () => {
      const mock = vi.fn().mockResolvedValue(undefined);
      const handler = vi.fn();
      const preventableMock = preventable(mock, [handler]);

      await preventableMock();

      expect(handler).toBeCalled();
      expect(mock).toBeCalled();
    });

    test('async handlers are handled correctly', async () => {
      const mock = vi.fn();
      const handler = vi.fn().mockResolvedValue(undefined);
      const preventableMock = preventable(mock, [handler]);

      await preventableMock();

      expect(handler).toBeCalled();
      expect(mock).toBeCalled();
    });

    test('preventDefault works correctly in async functions', async () => {
      const mock = vi.fn().mockResolvedValue(undefined);
      const handler = vi.fn();
      const preventableMock = preventable(mock, [
        async e => {
          e.preventDefault();
          handler();
        },
      ]);

      await preventableMock();

      expect(handler).toBeCalled();
      expect(mock).not.toBeCalled();
    });

    test('event.default() works correctly in async handlers', async () => {
      const mock = vi.fn().mockResolvedValue(undefined);
      const handler = vi.fn();
      const preventableMock = preventable(mock, [
        async e => {
          await e.default('custom-arg');
          handler();
        },
      ]);

      await preventableMock('original-arg');

      expect(handler).toBeCalled();
      expect(mock).toBeCalledWith('custom-arg');
    });
  });

  describe('error handling', () => {
    test('original function is not executed when handler throws an error', () => {
      const mock = vi.fn();
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const preventableMock = preventable(mock, [errorHandler]);

      expect(() => preventableMock()).toThrow('Handler error');
      expect(mock).not.toBeCalled();
    });

    test('original function is not executed when async handler throws an error', async () => {
      const spy = vi.fn();
      const defaultEvent = async () => {
        spy();
        return undefined;
      };
      const errorHandler = vi.fn().mockImplementation(async () => {
        throw new Error('Async handler error');
      });
      const preventableMock = preventable(defaultEvent, [errorHandler]);

      await expect(preventableMock()).rejects.toThrow('Async handler error');
      expect(spy).not.toBeCalled();
    });

    test('error is propagated when original function throws an error', () => {
      const mock = vi.fn().mockImplementation(() => {
        throw new Error('Original function error');
      });
      const preventableMock = preventable(mock, []);

      expect(() => preventableMock()).toThrow('Original function error');
    });
  });

  describe('complex scenarios', () => {
    test('conditional preventDefault works correctly', () => {
      const mock = vi.fn();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          if (e.params[0] === 'prevent') {
            e.preventDefault();
            handler1();
          } else {
            handler2();
          }
        },
      ]);

      // When preventDefault is called
      preventableMock('prevent');
      expect(handler1).toBeCalled();
      expect(mock).not.toBeCalled();

      // When preventDefault is not called
      preventableMock('allow');
      expect(handler2).toBeCalled();
      expect(mock).toBeCalledWith('allow');
    });

    test('handler can call the original function multiple times', () => {
      const mock = vi.fn();
      const handler = vi.fn();
      const preventableMock = preventable(mock, [
        e => {
          e.default('first');
          e.default('second');
          handler();
        },
      ]);

      preventableMock('original');

      expect(handler).toBeCalled();
      expect(mock).toBeCalledTimes(2);
      expect(mock).toBeCalledWith('first');
      expect(mock).toBeCalledWith('second');
    });

    test('original function is executed when there are no handlers and preventDefault is not called', () => {
      const mock = vi.fn();
      const preventableMock = preventable(mock, []);

      preventableMock('test');

      expect(mock).toBeCalledWith('test');
    });
  });
});
