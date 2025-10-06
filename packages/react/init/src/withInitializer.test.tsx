import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { withInitializer } from './withInitializer';

type UserData = {
  name: string;
  age: number;
};

type ComponentProps = {
  title: string;
};

const TestComponent = ({ title, name, age }: ComponentProps & Partial<UserData>) => (
  <div data-testid='test-component'>
    <h1>{title}</h1>
    {name && <p>Name: {name}</p>}
    {age && <p>Age: {age}</p>}
  </div>
);
TestComponent.displayName = 'TestComponent';

describe('withInitializer', () => {
  it('should render fallback while initializing', () => {
    const initializer = vi.fn(() => new Promise<UserData>(() => {}));
    const WrappedComponent = withInitializer<ComponentProps, UserData>(TestComponent, initializer);

    render(<WrappedComponent title='Test' />);

    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
  });

  it('should render component with initialized data', async () => {
    const mockData: UserData = { name: 'John', age: 30 };
    const initializer = vi.fn(() => Promise.resolve(mockData));
    const WrappedComponent = withInitializer<ComponentProps, UserData>(TestComponent, initializer);

    render(<WrappedComponent title='Test' />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('Name: John')).toBeInTheDocument();
      expect(screen.getByText('Age: 30')).toBeInTheDocument();
    });
  });

  it('should merge props with initialized data', async () => {
    const mockData: UserData = { name: 'Alice', age: 25 };
    const initializer = vi.fn(() => Promise.resolve(mockData));
    const WrappedComponent = withInitializer<ComponentProps, UserData>(TestComponent, initializer);

    render(<WrappedComponent title='User Profile' />);

    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Name: Alice')).toBeInTheDocument();
      expect(screen.getByText('Age: 25')).toBeInTheDocument();
    });
  });

  it('should set correct display name', () => {
    const initializer = vi.fn(() => Promise.resolve({ name: 'Test', age: 20 }));
    const WrappedComponent = withInitializer<ComponentProps, UserData>(TestComponent, initializer);

    expect(WrappedComponent.displayName).toBe('withInitializer(TestComponent)');
  });

  it('should use default empty fallback when not provided', () => {
    const initializer = vi.fn(() => new Promise<UserData>(() => {}));
    const WrappedComponent = withInitializer<ComponentProps, UserData>(TestComponent, initializer);

    render(<WrappedComponent title='Test' />);

    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
  });

  it('should handle initializer being called', async () => {
    const mockData: UserData = { name: 'Bob', age: 35 };
    const initializer = vi.fn(() => Promise.resolve(mockData));
    const WrappedComponent = withInitializer<ComponentProps, UserData>(TestComponent, initializer);

    render(<WrappedComponent title='Test' />);

    await waitFor(() => {
      expect(screen.getByText('Name: Bob')).toBeInTheDocument();
    });

    expect(initializer).toHaveBeenCalled();
  });
});
