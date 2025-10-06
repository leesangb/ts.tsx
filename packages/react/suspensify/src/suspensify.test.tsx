import { render, screen, waitFor } from '@testing-library/react';
import { Component, type ReactNode, Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { suspensify } from './suspensify';

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: unknown }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

describe('suspensify', () => {
  it('should return resolved value when promise succeeds', async () => {
    const getData = suspensify(() => Promise.resolve('test data'));

    function TestComponent() {
      const data = getData();
      return <div>{data}</div>;
    }

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <TestComponent />
      </Suspense>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('test data')).toBeInTheDocument();
    });
  });

  it('should throw error when promise rejects and component should not render', async () => {
    const error = new Error('test error');
    const getData = suspensify(() => Promise.reject(error));

    function TestComponent() {
      const data = getData();
      return <div data-testid='content'>{data}</div>;
    }

    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <TestComponent />
        </Suspense>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });
  });

  it('should work with complex data types', async () => {
    const userData = { id: 1, name: 'John', email: 'john@example.com' };
    const getUser = suspensify(() => Promise.resolve(userData));

    function UserComponent() {
      const user = getUser();
      return (
        <div>
          <span data-testid='name'>{user.name}</span>
          <span data-testid='email'>{user.email}</span>
        </div>
      );
    }

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <UserComponent />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('John');
      expect(screen.getByTestId('email')).toHaveTextContent('john@example.com');
    });
  });

  it('should handle delayed promises', async () => {
    const getData = suspensify(
      () =>
        new Promise<string>(resolve => {
          setTimeout(() => resolve('delayed data'), 100);
        }),
    );

    function TestComponent() {
      const data = getData();
      return <div>{data}</div>;
    }

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <TestComponent />
      </Suspense>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText('delayed data')).toBeInTheDocument();
      },
      { timeout: 200 },
    );
  });

  it('should be reusable across multiple components', async () => {
    const getData = suspensify(() => Promise.resolve('shared data'));

    function ComponentA() {
      const data = getData();
      return <div data-testid='component-a'>{data}</div>;
    }

    function ComponentB() {
      const data = getData();
      return <div data-testid='component-b'>{data}</div>;
    }

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ComponentA />
        <ComponentB />
      </Suspense>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('component-a')).toHaveTextContent('shared data');
      expect(screen.getByTestId('component-b')).toHaveTextContent('shared data');
    });
  });
});
