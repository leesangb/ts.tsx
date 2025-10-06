import { createContext } from 'react';

/**
 * State object provided by the StackNavigation context.
 *
 * @template T - The type of entries in the stack (must extend string)
 */
export type StackNavigationContextState<T extends string> = {
  /** Current stack of entries */
  stack: T[];
  /** Push a new entry onto the stack */
  push: (entry: T) => void;
  /** Pop one or more entries from the stack */
  pop: (count?: number) => void;
  /** Clear all entries from the stack */
  clear: () => void;
  /** Pop all entries except the first one */
  popToTop: () => void;
};

/**
 * Creates a React context for stack navigation.
 *
 * @template T - The type of entries in the stack (must extend string)
 * @returns A React context for StackNavigationContextState
 * @internal
 */
export const createStackNavigationContext = <T extends string>() => {
  return createContext<StackNavigationContextState<T> | null>(null);
};
