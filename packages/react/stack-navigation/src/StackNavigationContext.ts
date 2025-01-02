import { createContext } from 'react';

export type StackNavigationContextState<T extends string> = {
  stack: T[];
  push: (entry: T) => void;
  pop: (count?: number) => void;
  clear: () => void;
  popToTop: () => void;
};

export const createStackNavigationContext = <T extends string>() => {
  return createContext<StackNavigationContextState<T>>({
    stack: [],
    push: () => {},
    pop: () => {},
    clear: () => {},
    popToTop: () => {},
  });
};
