/**
 * Converts a Promise into a Suspense-compatible resource.
 *
 * This utility wraps a promise and returns a function that can be called within
 * a React component to retrieve the promise's result. It integrates with React Suspense
 * by throwing the promise when still pending, allowing Suspense to handle the loading state.
 *
 * @template T - The type of the promise's resolved value
 * @param promise - The promise to convert into a Suspense resource
 * @returns A function that returns the resolved value when called
 * @throws The original promise if still pending (caught by React Suspense)
 * @throws The error if the promise rejected
 *
 * @example
 * ```tsx
 * const fetchUser = suspensify(fetch('/api/user').then(r => r.json()));
 *
 * function UserProfile() {
 *   const user = fetchUser();
 *   return <div>{user.name}</div>;
 * }
 *
 * function App() {
 *   return (
 *     <Suspense fallback={<div>Loading...</div>}>
 *       <UserProfile />
 *     </Suspense>
 *   );
 * }
 * ```
 */
export const suspensify = <T>(promise: Promise<T>) => {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    res => {
      status = 'success';
      result = res;
    },
    err => {
      status = 'error';
      error = err;
    },
  );

  return (): T => {
    if (status === 'pending') {
      throw suspender;
    }
    if (status === 'error') {
      throw error;
    }
    return result!;
  };
};
