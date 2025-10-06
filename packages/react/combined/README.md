English | [한국어](./README.ko.md)

# @tstsx/combined

Compose multiple React components with a clean, type-safe API.

## Why?

Deeply nested component hierarchies (providers, HOCs, wrappers) create hard-to-read code. This library provides:

- **Flat component composition**: Replace nested JSX with a simple array
- **Type-safe props**: Full TypeScript support with autocomplete for each component's props
- **Cleaner code**: Eliminate rightward drift and improve readability
- **Zero runtime overhead**: Simple wrapper that uses `reduceRight` for composition

Perfect for: provider composition, HOC chaining, Radix UI component wrappers, and any pattern that creates deeply nested components.

## Installation

```bash
npm install @tstsx/combined
```

## Usage

### Provider Composition

**Before:**
```tsx
<Provider1 value="test">
  <Provider2 count={42}>
    <Provider3 enabled>
      <ChildComponent />
    </Provider3>
  </Provider2>
</Provider1>
```

**After:**
```tsx
<Combined
  components={[
    [Provider1, { value: 'test' }],
    [Provider2, { count: 42 }],
    [Provider3, { enabled: true }],
  ]}>
  <ChildComponent />
</Combined>
```

### Radix UI Components

**Before:**
```tsx
<Tooltip.Trigger asChild>
  <Dialog.Trigger asChild>
    <Menu.Trigger asChild>
      <MyButton />
    </Menu.Trigger>
  </Dialog.Trigger>
</Tooltip.Trigger>
```

**After:**
```tsx
<Combined
  components={[
    [Tooltip.Trigger, { asChild: true }],
    [Dialog.Trigger, { asChild: true }],
    [Menu.Trigger, { asChild: true }],
  ]}>
  <MyButton />
</Combined>
```

### Optional Props

Components with only optional props don't require the second element in the tuple:

```tsx
<Combined
  components={[
    [OptionalPropsProvider],
    [AnotherProvider, { config: true }],
  ]}>
  <Content />
</Combined>
```

## API

### `Combined`

The main component for composing multiple components.

**Props:**
- `components`: Array of tuples where each tuple is `[Component, props?]`
  - First element: React component
  - Second element (optional): Props object for the component
- `children`: React children to render inside the composed components

**Type Safety:**
- Each component's props are fully typed
- TypeScript will autocomplete and validate props for each component
- Optional props components can omit the props object

## Real-World Examples

### Context Providers

```tsx
function App() {
  return (
    <Combined
      components={[
        [ThemeProvider, { theme: 'dark' }],
        [AuthProvider, { apiUrl: '/api' }],
        [I18nProvider, { locale: 'en' }],
      ]}>
      <Routes />
    </Combined>
  );
}
```

### Higher-Order Components

```tsx
<Combined
  components={[
    [withAuth],
    [withLogging, { level: 'debug' }],
    [withErrorBoundary, { fallback: <Error /> }],
  ]}>
  <Dashboard />
</Combined>
```

### Form Field Wrappers

```tsx
<Combined
  components={[
    [Form.Field, { name: 'email' }],
    [Form.Control],
    [Form.Label, { htmlFor: 'email' }],
  ]}>
  <Input type="email" />
</Combined>
```

## How It Works

`Combined` uses `Array.reduceRight` to wrap components from the outside in. Each component receives the next nested component as its `children` prop, creating the same structure as manual nesting but with cleaner syntax.

## License

MIT
