import { render, screen, act } from '@testing-library/react';
import { createTypedErrorBoundary } from './TypedErrorBoundary';
import { describe, expect, it } from 'vitest';

// Define test error types
type TestError = { type: 'network'; message: string } | { type: 'validation'; field: string; message: string };

describe('TypedErrorBoundary', () => {
  const [ErrorBoundary, useErrorBoundary] = createTypedErrorBoundary<TestError>('TestErrorBoundary');

  const TestComponent = () => {
    const { throwError } = useErrorBoundary('');

    return (
      <div>
        <button
          type='button'
          onClick={() => throwError({ type: 'network', message: 'Network error' })}
          data-testid='network-error-btn'
        >
          Throw Network Error
        </button>
        <button
          type='button'
          onClick={() => throwError({ type: 'validation', field: 'email', message: 'Invalid email' })}
          data-testid='validation-error-btn'
        >
          Throw Validation Error
        </button>
        <div data-testid='content'>Content</div>
      </div>
    );
  };

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary
        fallback={{
          network: () => <div>Network Error</div>,
          validation: () => <div>Validation Error</div>,
        }}
      >
        <TestComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders network error fallback when network error is thrown', () => {
    render(
      <ErrorBoundary
        fallback={{
          network: error => <div data-testid='network-fallback'>{error.message}</div>,
          validation: () => <div>Validation Error</div>,
        }}
      >
        <TestComponent />
      </ErrorBoundary>,
    );

    act(() => {
      screen.getByTestId('network-error-btn').click();
    });

    expect(screen.getByTestId('network-fallback')).toHaveTextContent('Network error');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('renders validation error fallback when validation error is thrown', () => {
    render(
      <ErrorBoundary
        fallback={{
          network: () => <div>Network Error</div>,
          validation: error => (
            <div data-testid='validation-fallback'>
              {error.field}: {error.message}
            </div>
          ),
        }}
      >
        <TestComponent />
      </ErrorBoundary>,
    );

    act(() => {
      screen.getByTestId('validation-error-btn').click();
    });

    expect(screen.getByTestId('validation-fallback')).toHaveTextContent('email: Invalid email');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('resets error when resetError is called', () => {
    render(
      <ErrorBoundary
        fallback={{
          network: (error, resetError) => (
            <div>
              <div data-testid='network-fallback'>{error.message}</div>
              <button type='button' onClick={resetError} data-testid='reset-btn'>
                Reset
              </button>
            </div>
          ),
          validation: () => <div>Validation Error</div>,
        }}
      >
        <TestComponent />
      </ErrorBoundary>,
    );

    act(() => {
      screen.getByTestId('network-error-btn').click();
    });

    expect(screen.getByTestId('network-fallback')).toBeInTheDocument();

    act(() => {
      screen.getByTestId('reset-btn').click();
    });

    expect(screen.queryByTestId('network-fallback')).not.toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('has correct displayName', () => {
    expect(ErrorBoundary.displayName).toBe('TestErrorBoundary');
  });
});
