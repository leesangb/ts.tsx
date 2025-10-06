import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createExceptionBoundary } from './ExceptionBoundary';

// Define test exception types
type TestException = { type: 'network'; message: string } | { type: 'validation'; field: string; message: string };

describe('ExceptionBoundary', () => {
  const [ExceptionBoundary, useExceptionBoundary] = createExceptionBoundary<TestException>('TestExceptionBoundary');

  const TestComponent = () => {
    const { throwException } = useExceptionBoundary();

    return (
      <div>
        <button
          type='button'
          onClick={() => throwException({ type: 'network', message: 'Network error' })}
          data-testid='network-error-btn'
        >
          Throw Network Error
        </button>
        <button
          type='button'
          onClick={() => throwException({ type: 'validation', field: 'email', message: 'Invalid email' })}
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
      <ExceptionBoundary
        fallback={{
          network: () => <div>Network Error</div>,
          validation: () => <div>Validation Error</div>,
        }}
      >
        <TestComponent />
      </ExceptionBoundary>,
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders network error fallback when network error is thrown', () => {
    render(
      <ExceptionBoundary
        fallback={{
          network: exception => <div data-testid='network-fallback'>{exception.message}</div>,
          validation: () => <div>Validation Error</div>,
        }}
      >
        <TestComponent />
      </ExceptionBoundary>,
    );

    act(() => {
      screen.getByTestId('network-error-btn').click();
    });

    expect(screen.getByTestId('network-fallback')).toHaveTextContent('Network error');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('renders validation error fallback when validation error is thrown', () => {
    render(
      <ExceptionBoundary
        fallback={{
          network: () => <div>Network Error</div>,
          validation: exception => (
            <div data-testid='validation-fallback'>
              {exception.field}: {exception.message}
            </div>
          ),
        }}
      >
        <TestComponent />
      </ExceptionBoundary>,
    );

    act(() => {
      screen.getByTestId('validation-error-btn').click();
    });

    expect(screen.getByTestId('validation-fallback')).toHaveTextContent('email: Invalid email');
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('resets error when resetError is called', () => {
    render(
      <ExceptionBoundary
        fallback={{
          network: (exception, resetException) => (
            <div>
              <div data-testid='network-fallback'>{exception.message}</div>
              <button type='button' onClick={resetException} data-testid='reset-btn'>
                Reset
              </button>
            </div>
          ),
          validation: () => <div>Validation Error</div>,
        }}
      >
        <TestComponent />
      </ExceptionBoundary>,
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
    expect(ExceptionBoundary.displayName).toBe('TestExceptionBoundary');
  });
});
