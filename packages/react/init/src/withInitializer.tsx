import { Suspense, type ReactNode } from 'react';
import { suspensify } from './suspensify';

export function withInitializer<P extends Record<string, unknown>, R extends Record<string, unknown>>(
  Component: React.ComponentType<P & Partial<R>>,
  initializer: () => Promise<R>,
) {
  const getData = suspensify(initializer());

  const displayName = Component.displayName ?? 'Anonymous';

  function WithInitializer(props: P) {
    const data = getData();
    return <Component {...props} {...data} />;
  }
  WithInitializer.displayName = `withInitializer(${displayName})`;

  return WithInitializer;
}

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
