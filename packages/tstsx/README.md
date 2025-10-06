# @tstsx

A collection of type-safe utilities for React and TypeScript applications.

## Why?

Instead of installing each package separately, `@tstsx` provides a single installation point with automatic tree-shaking. Only import what you need, and bundlers will automatically exclude unused code.

## Installation

```bash
npm install @tstsx
```

## Usage

Import from specific subpaths for optimal tree-shaking:

```tsx
// Exception Boundary
import { createExceptionBoundary } from '@tstsx/exception-boundary';

// Initialization Utilities
import { withInitializer, suspensify } from '@tstsx/init';

// Stack Navigation
import { createStackNavigation } from '@tstsx/stack-navigation';

// Object Diff
import { objectDiff } from '@tstsx/object-diff';
```

## Packages

### Exception Boundary

Type-safe exception boundary with declarative error handling.

```tsx
import { createExceptionBoundary } from '@tstsx/exception-boundary';

type AppException =
  | { type: 'network-error'; message: string }
  | { type: 'not-found'; resource: string };

const [ExceptionBoundary, useExceptionBoundary] = 
  createExceptionBoundary<AppException>('AppExceptionBoundary');
```

[Full documentation](../react/exception-boundary/README.md)

### Init

React HOCs for handling async initialization with Suspense.

```tsx
import { withInitializer } from '@tstsx/init';

const Component = withInitializer(MyComponent, fetchData);
```

[Full documentation](../react/init/README.md)

### Stack Navigation

Type-safe stack-based navigation for modals, wizards, and more.

```tsx
import { createStackNavigation } from '@tstsx/stack-navigation';

const [StackNavigation, useStackNavigation] = createStackNavigation(
  'AppStack',
  { entries: ['home', 'profile', 'settings'] }
);
```

[Full documentation](../react/stack-navigation/README.md)

### Object Diff

Deep object comparison with advanced configuration.

```tsx
import { objectDiff } from '@tstsx/object-diff';

const diffs = objectDiff(before, after, {
  ignorePaths: ['metadata.timestamp'],
  ignoreTypes: ['function']
});
```

[Full documentation](../vanilla/object-diff/README.md)

## Tree-Shaking

This package is designed for optimal tree-shaking. When you import from a specific subpath:

```tsx
import { createStackNavigation } from '@tstsx/stack-navigation';
```

Your bundler will only include the `stack-navigation` module, not the entire library. This keeps your bundle size minimal.

## Individual Packages

If you only need one specific utility, you can still install individual packages:

```bash
npm install @tstsx/exception-boundary
npm install @tstsx/init
npm install @tstsx/stack-navigation
npm install @tstsx/object-diff
```

## License

MIT
