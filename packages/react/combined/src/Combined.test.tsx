import { render, screen } from '@testing-library/react';
import { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';
import { Combined } from './Combined';

const Provider1: ComponentType<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <div data-testid='provider1' data-value={value}>
    {children}
  </div>
);

const Provider2: ComponentType<{ count: number; children: React.ReactNode }> = ({ count, children }) => (
  <div data-testid='provider2' data-count={count}>
    {children}
  </div>
);

const Provider3: ComponentType<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => (
  <div data-testid='provider3' data-enabled={enabled}>
    {children}
  </div>
);

const OptionalPropsProvider: ComponentType<{ children?: React.ReactNode }> = ({ children }) => (
  <div data-testid='optional'>{children}</div>
);

describe('Combined', () => {
  it('should render nested components in correct order', () => {
    render(
      <Combined
        components={[
          [Provider1, { value: 'test' }],
          [Provider2, { count: 42 }],
          [Provider3, { enabled: true }],
        ]}
      >
        <div data-testid='child'>Child Content</div>
      </Combined>,
    );

    const child = screen.getByTestId('child');
    const provider3 = screen.getByTestId('provider3');
    const provider2 = screen.getByTestId('provider2');
    const provider1 = screen.getByTestId('provider1');

    expect(provider1).toContainElement(provider2);
    expect(provider2).toContainElement(provider3);
    expect(provider3).toContainElement(child);

    expect(provider1).toHaveAttribute('data-value', 'test');
    expect(provider2).toHaveAttribute('data-count', '42');
    expect(provider3).toHaveAttribute('data-enabled', 'true');
  });

  it('should render children correctly', () => {
    render(
      <Combined components={[[Provider1, { value: 'hello' }]]}>
        <span>Test Child</span>
      </Combined>,
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should work with components that have optional props', () => {
    render(
      <Combined components={[[OptionalPropsProvider]]}>
        <div data-testid='child'>Content</div>
      </Combined>,
    );

    expect(screen.getByTestId('optional')).toContainElement(screen.getByTestId('child'));
  });

  it('should handle empty components array', () => {
    render(
      <Combined components={[]}>
        <div data-testid='child'>Alone</div>
      </Combined>,
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should work with single component', () => {
    render(
      <Combined components={[[Provider1, { value: 'single' }]]}>
        <div data-testid='child'>Single</div>
      </Combined>,
    );

    const provider = screen.getByTestId('provider1');
    expect(provider).toHaveAttribute('data-value', 'single');
    expect(provider).toContainElement(screen.getByTestId('child'));
  });
});
