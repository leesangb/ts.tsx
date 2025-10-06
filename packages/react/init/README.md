# @tstsx/init

React HOCs for handling async initialization with Suspense integration.

## Why?

When building React applications, you often need to load data before rendering a component. This library provides:

- **Suspense-ready**: Built on React Suspense for seamless loading states
- **Type-safe**: Full TypeScript support with proper type inference
- **Simple API**: Wrap your component and provide an initializer function
- **Data merging**: Automatically merges initialized data with component props

## Installation

```bash
npm install @tstsx/init
```

## Usage

### Basic Example with `withInitializer`

```tsx
import { withInitializer } from '@tstsx/init';
import { Suspense } from 'react';

type UserData = {
  name: string;
  age: number;
};

type Props = {
  userId: string;
};

const UserProfile = ({ userId, name, age }: Props & Partial<UserData>) => (
  <div>
    <h1>User: {userId}</h1>
    {name && <p>Name: {name}</p>}
    {age && <p>Age: {age}</p>}
  </div>
);

const fetchUserData = async (): Promise<UserData> => {
  const response = await fetch('/api/user');
  return response.json();
};

const UserProfileWithData = withInitializer<Props, UserData>(
  UserProfile,
  fetchUserData
);

function App() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfileWithData userId="123" />
    </Suspense>
  );
}
```

### Using `withInitializerSuspense` (Suspense Included)

```tsx
import { withInitializerSuspense } from '@tstsx/init';

const UserProfileWithSuspense = withInitializerSuspense<Props, UserData>(
  UserProfile,
  fetchUserData,
  <div>Loading user...</div> // Custom fallback
);

function App() {
  // No need to wrap with Suspense - it's included!
  return <UserProfileWithSuspense userId="123" />;
}
```

### Using `suspensify` Directly

```tsx
import { suspensify } from '@tstsx/init';
import { Suspense } from 'react';

const dataPromise = fetch('/api/data').then(r => r.json());
const getData = suspensify(dataPromise);

function Component() {
  const data = getData(); // Throws promise to Suspense on first render
  return <div>{data.value}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
}
```

## API

### `withInitializer<P, R>(Component, initializer)`

Creates a higher-order component that loads data before rendering. Requires wrapping with Suspense.

**Parameters:**
- `Component`: React component that receives both props `P` and initialized data `R`
- `initializer`: Async function that returns data of type `R`

**Returns:**
- Component that accepts props of type `P` and automatically provides `R` to the wrapped component

**Note:** The wrapped component must be used inside a `<Suspense>` boundary.

### `withInitializerSuspense<P, R>(Component, initializer, fallback?)`

Same as `withInitializer` but includes Suspense wrapper.

**Parameters:**
- `Component`: React component that receives both props `P` and initialized data `R`
- `initializer`: Async function that returns data of type `R`
- `fallback`: (Optional) React node to show while loading. Defaults to `<></>`

**Returns:**
- Component that accepts props of type `P` with built-in Suspense handling

### `suspensify<T>(promise)`

Converts a Promise into a Suspense-compatible function.

**Parameters:**
- `promise`: Promise to suspensify

**Returns:**
- Function that returns the resolved value or throws the promise/error to Suspense

**Usage:**
- Call the returned function inside a component wrapped with Suspense
- On first render (pending), it throws the promise to trigger Suspense
- On success, it returns the resolved value
- On error, it throws the error to be caught by Error Boundary

## How It Works

The library uses React Suspense's throw mechanism:

1. **Pending**: The component throws a promise, triggering Suspense fallback
2. **Success**: The component receives the resolved data and renders normally  
3. **Error**: The component throws the error to be caught by an Error Boundary

This provides a clean, declarative way to handle async operations without managing loading states manually.

## License

MIT
