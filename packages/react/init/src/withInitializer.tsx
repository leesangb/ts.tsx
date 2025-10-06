import { Suspense, type ReactNode } from 'react';
import { suspensify } from '@tstsx/suspensify';

/**
 * Higher-order component that initializes a component with async data.
 *
 * Wraps a component and provides it with data from an async initializer function.
 * The wrapped component must be used within a Suspense boundary. For automatic
 * Suspense wrapping, use `withInitializerSuspense` instead.
 *
 * @template P - Props type of the component (excluding initialized data)
 * @template R - Type of data returned by the initializer
 * @param Component - The component to wrap
 * @param initializer - Async function that returns initialization data
 * @returns A new component that suspends until initialization completes
 *
 * @example
 * ```tsx
 * type Props = { userId: string };
 * type Data = { userName: string };
 *
 * const UserProfile = ({ userId, userName }: Props & Partial<Data>) => (
 *   <div>User: {userName}</div>
 * );
 *
 * const InitializedProfile = withInitializer(
 *   UserProfile,
 *   async () => ({ userName: 'John' })
 * );
 *
 * function App() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <InitializedProfile userId="123" />
 *     </Suspense>
 *   );
 * }
 * ```
 */
export function withInitializer<P extends Record<string, unknown>, R extends Record<string, unknown>>(
  Component: React.ComponentType<P & Partial<R>>,
  initializer: () => Promise<R>,
) {
  const getData = suspensify(initializer);

  const displayName = Component.displayName ?? 'Anonymous';

  function WithInitializer(props: P) {
    const data = getData();
    return <Component {...props} {...data} />;
  }
  WithInitializer.displayName = `withInitializer(${displayName})`;

  return WithInitializer;
}

/**
 * Higher-order component that initializes a component with async data and automatically wraps it in Suspense.
 *
 * Similar to `withInitializer`, but includes a Suspense boundary so you don't need to wrap it yourself.
 *
 * @template P - Props type of the component (excluding initialized data)
 * @template R - Type of data returned by the initializer
 * @param Component - The component to wrap
 * @param initializer - Async function that returns initialization data
 * @param fallback - Optional fallback UI to display while loading (defaults to empty fragment)
 * @returns A new component with built-in Suspense boundary
 *
 * @example
 * ```tsx
 * type Props = { userId: string };
 * type Data = { userName: string };
 *
 * const UserProfile = ({ userId, userName }: Props & Partial<Data>) => (
 *   <div>User: {userName}</div>
 * );
 *
 * const InitializedProfile = withInitializerSuspense(
 *   UserProfile,
 *   async () => ({ userName: 'John' }),
 *   <div>Loading user...</div>
 * );
 *
 * function App() {
 *   return <InitializedProfile userId="123" />;
 * }
 * ```
 */
export const withInitializerSuspense = <P extends Record<string, unknown>, R extends Record<string, unknown>>(
  Component: React.ComponentType<P & Partial<R>>,
  initializer: () => Promise<R>,
  fallback: ReactNode = <></>,
) => {
  const Initialized = withInitializer(Component, initializer);
  const displayName = Component.displayName ?? 'Anonymous';

  function WithInitializerSuspense(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Initialized {...(props as P & Partial<R>)} />
      </Suspense>
    );
  }
  WithInitializerSuspense.displayName = `withInitializerSuspense(${displayName})`;

  return WithInitializerSuspense;
};
