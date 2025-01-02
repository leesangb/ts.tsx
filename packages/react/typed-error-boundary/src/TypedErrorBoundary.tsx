import { createContext } from '@radix-ui/react-context';
import { useState, type ReactNode } from 'react';

export const createTypedErrorBoundary = <T extends { type: string }>(displayName: string) => {
  const [Provider, useErrorBoundary] = createContext<{
    throwError: (error: T) => void;
  }>(`Internal${displayName}`);

  const TypedErrorBoundary = ({
    children,
    fallback,
  }: {
    children: ReactNode;
    fallback: {
      [key in T['type']]: (error: T & { type: key }, resetError: () => void) => ReactNode;
    };
  }) => {
    const [error, setError] = useState<T | null>(null);

    const resetError = () => setError(null);

    return (
      <Provider throwError={setError}>
        {error ? fallback[error.type as keyof typeof fallback](error, resetError) : children}
      </Provider>
    );
  };

  TypedErrorBoundary.displayName = displayName;

  return [TypedErrorBoundary, useErrorBoundary] as const;
};
