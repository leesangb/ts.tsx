import { createContext, type ReactNode, useContext, useState } from 'react';

/**
 * Creates a type-safe exception boundary with a custom hook for throwing exceptions.
 *
 * @template T - Exception type that must have a `type` property for discrimination
 * @param displayName - Name used for the component and hook (e.g., "ErrorBoundary")
 * @returns A tuple containing the ExceptionBoundary component and useExceptionBoundary hook
 *
 * @example
 * ```tsx
 * type MyException = { type: 'error', message: string } | { type: 'warning', code: number };
 * const [ErrorBoundary, useErrorBoundary] = createExceptionBoundary<MyException>('ErrorBoundary');
 *
 * function App() {
 *   return (
 *     <ErrorBoundary
 *       fallback={{
 *         error: (ex, reset) => <div>Error: {ex.message} <button onClick={reset}>Reset</button></div>,
 *         warning: (ex, reset) => <div>Warning: {ex.code}</div>
 *       }}
 *     >
 *       <MyComponent />
 *     </ErrorBoundary>
 *   );
 * }
 *
 * function MyComponent() {
 *   const { throwException } = useErrorBoundary();
 *   return <button onClick={() => throwException({ type: 'error', message: 'Failed!' })}>Throw</button>;
 * }
 * ```
 */
export const createExceptionBoundary = <T extends { type: string }>(displayName: string) => {
  const Context = createContext<{
    throwException: (exception: T) => void;
  } | null>(null);

  Context.displayName = `${displayName}Context`;

  /**
   * Hook to access the exception boundary's throwException function.
   * Must be used within the corresponding ExceptionBoundary component.
   *
   * @throws {Error} If used outside of the ExceptionBoundary component
   * @returns Object containing throwException function
   */
  const useExceptionBoundary = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`use${displayName} must be used within a ${displayName}`);
    }
    return context;
  };

  /**
   * Exception boundary component that catches and displays exceptions thrown by child components.
   *
   * @param props - Component props
   * @param props.children - Child components to render when no exception is active
   * @param props.fallback - Object mapping exception types to their fallback render functions
   */
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
