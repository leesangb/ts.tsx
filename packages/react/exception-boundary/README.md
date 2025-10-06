# @tstsx/exception-boundary

English | [한국어](./README.ko.md)

Type-safe exception boundary for React applications with declarative error handling.

## Why?

Traditional error boundaries in React rely on JavaScript errors being thrown, which can be unpredictable and hard to manage. This library provides:

- **Type-safe exceptions**: Define your exception types and get full TypeScript support
- **Declarative error handling**: Handle different exception types with different UI components
- **Controlled error flow**: Throw exceptions programmatically without relying on runtime errors
- **Better DX**: Autocomplete and type checking for exception types and handlers

## Installation

```bash
npm install @tstsx/exception-boundary
```

## Usage

### Basic Example

```tsx
import { createExceptionBoundary } from '@tstsx/exception-boundary';

type AppException =
  | { type: 'network-error'; message: string; statusCode: number }
  | { type: 'not-found'; resource: string }
  | { type: 'unauthorized' };

const [ExceptionBoundary, useExceptionBoundary] = createExceptionBoundary<AppException>('AppExceptionBoundary');

function App() {
  return (
    <ExceptionBoundary
      fallback={{
        'network-error': (exception, reset) => (
          <div>
            <h1>Network Error</h1>
            <p>{exception.message} (Status: {exception.statusCode})</p>
            <button onClick={reset}>Retry</button>
          </div>
        ),
        'not-found': (exception, reset) => (
          <div>
            <h1>Not Found</h1>
            <p>Resource "{exception.resource}" was not found</p>
            <button onClick={reset}>Go Back</button>
          </div>
        ),
        'unauthorized': (exception, reset) => (
          <div>
            <h1>Unauthorized</h1>
            <button onClick={reset}>Login</button>
          </div>
        ),
      }}
    >
      <YourApp />
    </ExceptionBoundary>
  );
}

function YourComponent() {
  const { throwException } = useExceptionBoundary();

  const handleClick = async () => {
    try {
      await fetchData();
    } catch (error) {
      throwException({
        type: 'network-error',
        message: 'Failed to fetch data',
        statusCode: 500,
      });
    }
  };

  return <button onClick={handleClick}>Fetch Data</button>;
}
```

## API

### `createExceptionBoundary<T>(displayName)`

Creates a new exception boundary with the specified exception type.

**Parameters:**
- `displayName`: String name for the boundary (used in error messages and React DevTools)

**Returns:**
- `[ExceptionBoundary, useExceptionBoundary]`: A tuple containing the boundary component and hook

### `ExceptionBoundary`

The boundary component that catches exceptions.

**Props:**
- `children`: React children to render
- `fallback`: Object mapping exception types to render functions
  - Each function receives `(exception, resetException) => ReactNode`
  - `exception`: The thrown exception with full type information
  - `resetException`: Function to clear the exception and re-render children

### `useExceptionBoundary()`

Hook to access exception boundary functionality.

**Returns:**
- `throwException(exception)`: Function to throw a typed exception

## License

MIT
