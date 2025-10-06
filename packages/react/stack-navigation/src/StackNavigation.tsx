import { Fragment, type PropsWithChildren, type ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { createStackNavigationContext, type StackNavigationContextState } from './StackNavigationContext';

type CreateStackNavigationProps<T extends string> = {
  /**
   * List of values that can be used in StackNavigation
   */
  entries?: readonly [T, ...T[]];
};

/**
 * Creates a type-safe stack navigation system with React components and hooks.
 *
 * Generates a StackNavigation component and hook for managing a stack-based navigation pattern.
 * Optionally provide an `entries` array for compile-time type safety on navigation values.
 *
 * @template T - The type of stack entries (must extend string)
 * @param displayName - Name for the StackNavigation component (used in error messages)
 * @param options - Configuration options
 * @param options.entries - Optional array of allowed entry values for type safety
 * @returns A tuple containing [StackNavigation component, useStackNavigation hook]
 *
 * @example
 * ```tsx
 * const [Navigation, useNavigation] = createStackNavigation('AppNavigation', {
 *   entries: ['home', 'profile', 'settings'] as const
 * });
 *
 * function App() {
 *   return (
 *     <Navigation initialStack={['home']}>
 *       <Navigation.Entry value="home">
 *         <HomePage />
 *       </Navigation.Entry>
 *       <Navigation.Entry value="profile">
 *         <ProfilePage />
 *       </Navigation.Entry>
 *       <Navigation.Trigger>
 *         {({ push }) => (
 *           <button onClick={() => push('profile')}>Go to Profile</button>
 *         )}
 *       </Navigation.Trigger>
 *     </Navigation>
 *   );
 * }
 * ```
 */
export const createStackNavigation = <T extends string>(
  displayName: string,
  { entries }: CreateStackNavigationProps<T> = {},
) => {
  const StackContext = createStackNavigationContext<T>();

  const StackProvider = ({ children, ...props }: PropsWithChildren<StackNavigationContextState<T>>) => {
    return <StackContext.Provider value={props}>{children}</StackContext.Provider>;
  };

  /**
   * Hook to access the stack navigation context.
   * Must be used within the corresponding StackNavigation component.
   *
   * @throws {Error} If used outside of the StackNavigation component
   * @returns Stack navigation state and methods
   */
  const useStackNavigation = () => {
    const context = useContext(StackContext);
    if (!context) {
      throw new Error(`${displayName} not found. Please wrap your component in ${displayName}.`);
    }

    return context;
  };

  type StackNavigationProps<T extends string> = PropsWithChildren<{
    /** Initial stack state (defaults to first entry if entries are provided) */
    initialStack?: T[];
    /** Callback that receives the current stack whenever it changes */
    onChangeStack?: (stack: T[]) => void;
  }>;

  /**
   * Stack navigation container component.
   * Manages a stack of entries and provides navigation methods to children.
   *
   * @param props - Component props
   * @param props.children - Child components to render
   * @param props.initialStack - Initial stack state
   * @param props.onChangeStack - Callback that receives the current stack whenever it changes
   */
  const StackNavigation = ({ children, initialStack, onChangeStack }: StackNavigationProps<T>) => {
    const [stack, setStack] = useState<T[]>(() => {
      return initialStack || (entries ? [entries[0]] : []);
    });

    const onChangeStackRef = useRef(onChangeStack);
    onChangeStackRef.current = onChangeStack;

    useEffect(() => {
      onChangeStackRef.current?.(stack);
    }, [stack]);

    const push = (entry: T) => {
      setStack(stack => stack.concat(entry));
    };

    const pop = (count = 1) => {
      if (stack.length === 0) {
        return;
      }
      setStack(stack => stack.slice(0, stack.length - count));
    };

    const clear = () => {
      setStack([]);
    };

    const popToTop = () => {
      if (stack.length === 0) {
        return;
      }
      setStack(stack => stack.slice(0, 1));
    };

    return (
      <StackProvider stack={stack} push={push} pop={pop} clear={clear} popToTop={popToTop}>
        {children}
      </StackProvider>
    );
  };

  StackNavigation.displayName = displayName;

  type StackTriggerProps<T extends string> = {
    /** Render function that receives navigation methods */
    children: (navigate: Pick<StackNavigationContextState<T>, 'push' | 'pop' | 'clear'>) => ReactElement;
  };

  /**
   * Component that provides access to navigation methods via render props.
   * Useful for triggering navigation from within the stack.
   *
   * @example
   * ```tsx
   * <Navigation.Trigger>
   *   {({ push, pop }) => (
   *     <>
   *       <button onClick={() => push('settings')}>Settings</button>
   *       <button onClick={() => pop()}>Back</button>
   *     </>
   *   )}
   * </Navigation.Trigger>
   * ```
   */
  const Trigger = ({ children }: StackTriggerProps<T>) => {
    const { push, pop, clear } = useStackNavigation();

    return children({ push, pop, clear });
  };

  /**
   * Component that renders its children only when it matches the current top stack entry.
   *
   * @param props - Component props
   * @param props.value - The entry value to match against the current stack top
   * @param props.children - Content to render when this entry is active
   * @param props.asChild - If true, renders children without a wrapper div
   *
   * @example
   * ```tsx
   * <Navigation.Entry value="home">
   *   <HomePage />
   * </Navigation.Entry>
   * <Navigation.Entry value="settings" asChild>
   *   <SettingsPage />
   * </Navigation.Entry>
   * ```
   */
  const Entry = ({ value, children, asChild, ...props }: PropsWithChildren<{ value: T; asChild?: boolean }>) => {
    const { stack } = useStackNavigation();
    const Comp = asChild ? Fragment : 'div';

    return value === stack.at(-1) ? <Comp {...props}>{children}</Comp> : null;
  };

  type DynamicEntryProps<T extends string> = {
    /** Render function that receives the current stack entry */
    children: (entry: T) => ReactElement;
  };

  /**
   * Component that renders based on the current top stack entry.
   * Useful when you need to render different content based on the current entry.
   *
   * @example
   * ```tsx
   * <Navigation.DynamicEntry>
   *   {(current) => (
   *     <div>Current page: {current}</div>
   *   )}
   * </Navigation.DynamicEntry>
   * ```
   */
  const DynamicEntry = ({ children, ...props }: DynamicEntryProps<T>) => {
    const { stack } = useStackNavigation();
    const current = stack.at(-1);
    return current ? (
      <Entry {...props} value={current}>
        {children(current)}
      </Entry>
    ) : null;
  };

  StackNavigation.Trigger = Trigger;
  StackNavigation.Entry = Entry;
  StackNavigation.DynamicEntry = DynamicEntry;

  return [StackNavigation, useStackNavigation] as const;
};

/**
 * Default StackNavigation component without predefined entries.
 * For type-safe entry values, use `createStackNavigation` with the `entries` option.
 */
const [StackNavigation, useStackNavigation] = createStackNavigation('StackNavigation');

export { StackNavigation, useStackNavigation };
