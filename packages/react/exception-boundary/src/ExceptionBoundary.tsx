import { useState, type ReactNode, createContext, useContext } from 'react';

export const createExceptionBoundary = <T extends { type: string }>(displayName: string) => {
  const Context = createContext<{
    throwException: (exception: T) => void;
  } | null>(null);

  Context.displayName = `${displayName}Context`;

  const useExceptionBoundary = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`use${displayName} must be used within a ${displayName}`);
    }
    return context;
  };

  const ExceptionBoundary = ({
    children,
    fallback,
  }: {
    children: ReactNode;
    fallback: {
      [key in T['type']]: (exception: T & { type: key }, resetException: () => void) => ReactNode;
    };
  }) => {
    const [exception, setException] = useState<T | null>(null);

    const resetException = () => setException(null);

    return (
      <Context.Provider value={{ throwException: setException }}>
        {exception ? fallback[exception.type as keyof typeof fallback](exception, resetException) : children}
      </Context.Provider>
    );
  };

  ExceptionBoundary.displayName = displayName;

  return [ExceptionBoundary, useExceptionBoundary] as const;
};
