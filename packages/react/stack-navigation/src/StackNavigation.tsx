import { Fragment, type PropsWithChildren, type ReactElement, useContext, useEffect, useRef, useState } from 'react';
import { type StackNavigationContextState, createStackNavigationContext } from './StackNavigationContext';

type CreateStackNavigationProps<T extends string> = {
  /**
   * List of values that can be used in StackNavigation
   */
  entries?: readonly [T, ...T[]];
};

/**
 * Function to create StackNavigation component. If `entries` is specified, child components will receive type support.
 * If `entries` is not specified, child components will treat everything as `string`
 *
 * @example
 * const { StackNavigation } = createStackNavigation({ entries: ['hello', 'world'] });
 *
 * const Component = () => {
 *   return (
 *    <StackNavigation>
 *      <StackNavigation.Entry value={'hello'}>...</StackNavigation.Entry>
 *                             // ^ OK
 *      <StackNavigation.Entry value={'world'}>...</StackNavigation.Entry>
 *                             // ^ Type 'world' is not assignable to type 'hello' | 'world'
 *      <StackNavigation.Trigger>
 *        {({ push }) => <button onClick={
 *          push('hello');       // OK
 *          push('world');    // Type 'world' is not assignable to type 'hello' | 'world'
 *        }>...</button>}
 *      </StackNavigation.Trigger>
 *    </StackNavigation>
 *  )
 * }
 * @param entries List of entries
 */
export const createStackNavigation = <T extends string>(
  displayName: string,
  { entries }: CreateStackNavigationProps<T> = {},
) => {
  const StackContext = createStackNavigationContext<T>();

  const StackProvider = ({ children, ...props }: PropsWithChildren<StackNavigationContextState<T>>) => {
    return <StackContext.Provider value={props}>{children}</StackContext.Provider>;
  };

  const useStackNavigation = () => {
    const context = useContext(StackContext);
    if (!context) {
      throw new Error('StackNavigation Provider not found.');
    }

    return context;
  };

  type StackNavigationProps<T extends string> = PropsWithChildren<{
    initialStack?: T[];
    onChangeStack?: (stack: T[]) => void;
  }>;

  /**
   * @param children Child components to render
   * @param initialStack Initial stack state
   * @param onChangeStack Callback that receives the current stack whenever it changes
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
    children: (navigate: Pick<StackNavigationContextState<T>, 'push' | 'pop' | 'clear'>) => ReactElement;
  };
  const Trigger = ({ children }: StackTriggerProps<T>) => {
    const { push, pop, clear } = useStackNavigation();

    return children({ push, pop, clear });
  };

  const Entry = ({ value, children, asChild, ...props }: PropsWithChildren<{ value: T; asChild?: boolean }>) => {
    const { stack } = useStackNavigation();
    const Comp = asChild ? Fragment : 'div';

    return value === stack.at(-1) ? <Comp {...props}>{children}</Comp> : null;
  };

  type DynamicEntryProps<T extends string> = {
    children: (entry: T) => ReactElement;
  };
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

const [StackNavigation, useStackNavigation] = createStackNavigation('StackNavigation');

export { StackNavigation, useStackNavigation };
