type VoidFn<ARGS extends any[] = any[]> = (...args: ARGS) => void;

type VoidPromise<ARGS extends any[] = any[]> = (...args: ARGS) => Promise<void>;

function isVoidPromiseLike<ARGS extends any[]>(fn: (...args: ARGS) => void | Promise<void>): fn is VoidPromise<ARGS> {
  return ('then' in fn && typeof fn.then === 'function') || (fn as any)[Symbol.toStringTag] === 'AsyncFunction';
}

export namespace preventable {
  /**
   * Event object received in handler functions.
   *
   * @template T - Type of the original function (synchronous or asynchronous)
   */
  export type Event<T extends VoidFn | VoidPromise> = {
    /** Whether preventDefault() has been called */
    defaultPrevented: boolean;
    /** Parameters passed to the original function */
    params: Parameters<T>;
    /** Method to invoke the original function (can be called with different parameters) */
    default: T;
    /** Method to prevent execution of the original function */
    preventDefault: () => void;
  };

  /**
   * Type of handler functions.
   *
   * @template T - Type of the original function (synchronous or asynchronous)
   */
  export type EventHandler<T extends VoidFn | VoidPromise> = (event: Event<T>) => ReturnType<T>;
}

export function preventable<T extends VoidPromise>(defaultAction: T, handlers: preventable.EventHandler<T>[]): T;
export function preventable<T extends VoidFn>(defaultAction: T, handlers: preventable.EventHandler<T>[]): T;
/**
 * Creates a wrapper function that can intercept and conditionally prevent function execution.
 *
 * This function executes multiple handlers before running the original function,
 * and allows handlers to prevent execution of the original function by calling `preventDefault()`.
 *
 * @param defaultAction - The function to execute by default (synchronous or asynchronous)
 * @param handlers - Array of handler functions to call before execution
 * @returns A wrapper function with the same signature as the original function
 *
 * @example
 * ```typescript
 * // Basic usage
 * const originalFunction = (message: string) => {
 *   console.log('Original:', message);
 * };
 *
 * const wrappedFunction = preventable(originalFunction, [
 *   (event) => {
 *     if (event.params[0] === 'block') {
 *       event.preventDefault();
 *       console.log('Blocked!');
 *     }
 *   }
 * ]);
 *
 * wrappedFunction('hello'); // Logs "Original: hello"
 * wrappedFunction('block'); // Logs "Blocked!", original function not executed
 * ```
 *
 * @example
 * ```typescript
 * // Using async functions
 * const asyncFunction = async (data: any) => {
 *   await saveToDatabase(data);
 * };
 *
 * const wrappedAsync = preventable(asyncFunction, [
 *   async (event) => {
 *     const isValid = await validateData(event.params[0]);
 *     if (!isValid) {
 *       event.preventDefault();
 *       throw new Error('Invalid data');
 *     }
 *   }
 * ]);
 *
 * await wrappedAsync(userData);
 * ```
 *
 * @example
 * ```typescript
 * // Multiple handlers with conditional execution
 * const submitForm = (formData: FormData) => {
 *   console.log('Submitting form...');
 * };
 *
 * const wrappedSubmit = preventable(submitForm, [
 *   (event) => {
 *     // Logging
 *     console.log('Form submission attempt:', event.params[0]);
 *   },
 *   (event) => {
 *     // Validation
 *     if (!event.params[0].has('email')) {
 *       event.preventDefault();
 *       console.log('Email is required');
 *     }
 *   },
 *   (event) => {
 *     // Additional validation
 *     if (!event.defaultPrevented && event.params[0].get('email')?.length < 5) {
 *       event.preventDefault();
 *       console.log('Email too short');
 *     }
 *   }
 * ]);
 * ```
 *
 * @example
 * ```typescript
 * // Calling original function with custom parameters
 * const processData = (data: string) => {
 *   console.log('Processing:', data);
 * };
 *
 * const wrappedProcess = preventable(processData, [
 *   (event) => {
 *     // Call original function with different parameters
 *     event.default('Modified: ' + event.params[0]);
 *     event.preventDefault(); // Won't execute with original parameters
 *   }
 * ]);
 *
 * wrappedProcess('test'); // Logs "Processing: Modified: test"
 * ```
 */
export function preventable<const T extends VoidPromise | VoidFn>(
  defaultAction: T,
  handlers: preventable.EventHandler<T>[],
) {
  if (isVoidPromiseLike(defaultAction) || handlers.some(isVoidPromiseLike)) {
    const voidPromise = defaultAction as VoidPromise;
    return async (...args: Parameters<typeof voidPromise>) => {
      let _prevented = false;
      const event: preventable.Event<typeof voidPromise> = {
        get defaultPrevented() {
          return _prevented;
        },
        params: args,
        async default(...args: Parameters<typeof voidPromise>) {
          await voidPromise(...args);
          this.preventDefault();
        },
        preventDefault: () => {
          _prevented = true;
        },
      };

      for (const handler of handlers) {
        // @ts-ignore
        await handler(event);
      }
      if (!event.defaultPrevented) {
        await event.default(...args);
      }
    };
  }
  const voidFunction = defaultAction as VoidFn;

  return (...args: Parameters<typeof voidFunction>) => {
    let _prevented = false;
    const event: preventable.Event<typeof voidFunction> = {
      get defaultPrevented() {
        return _prevented;
      },
      params: args,
      default(...args: Parameters<typeof voidFunction>) {
        voidFunction(...args);
        this.preventDefault();
      },
      preventDefault: () => {
        _prevented = true;
      },
    };

    for (const handler of handlers) {
      // @ts-ignore
      handler(event);
    }
    if (!event.defaultPrevented) {
      event.default(...args);
    }
  };
}
