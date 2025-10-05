import { Suspense, type ReactNode } from 'react';
import { suspensify } from './suspensify';

export function withInitializer<P extends Record<string, unknown>, R extends Record<string, unknown>>(
  Component: React.ComponentType<P & Partial<R>>,
  initializer: () => Promise<R>,
  fallback: ReactNode = <></>,
) {
  const getData = suspensify(initializer());

  const displayName = Component.displayName ?? 'Anonymous';

  function Initiliazed(props: P) {
    const data = getData();
    return <Component {...props} {...data} />;
  }
  Initiliazed.displayName = `initialized(${displayName})`;

  function WithInitializer(props: P & Partial<R>) {
    return (
      <Suspense fallback={fallback}>
        <Initiliazed {...props} />
      </Suspense>
    );
  }
  WithInitializer.displayName = `withInitializer(${displayName})`;

  return WithInitializer;
}
