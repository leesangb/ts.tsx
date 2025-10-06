English | [한국어](./README.ko.md)

# @tstsx/stack-navigation

Type-safe stack-based navigation for React applications.

## Why?

Managing UI stacks (modals, drawers, wizards, etc.) in React can be complex and error-prone. This library provides:

- **Type-safe navigation**: Define your stack entries and get full TypeScript autocomplete
- **Declarative API**: Define stack entries as components, trigger navigation with hooks
- **Stack operations**: Push, pop, clear, and pop-to-top operations
- **Flexible rendering**: Use static or dynamic entry rendering
- **State management**: Optional callbacks to sync with external state

Perfect for: multi-step forms, modal stacks, wizard flows, drawer navigation, and any UI pattern that follows a stack paradigm.

## Installation

```bash
npm install @tstsx/stack-navigation
```

## Usage

### Basic Example

```tsx
import { createStackNavigation } from '@tstsx/stack-navigation';

const [StackNavigation, useStackNavigation] = createStackNavigation(
  'AppStack',
  { entries: ['home', 'profile', 'settings'] }
);

function App() {
  return (
    <StackNavigation initialStack={['home']}>
      <StackNavigation.Entry value="home">
        <HomePage />
      </StackNavigation.Entry>

      <StackNavigation.Entry value="profile">
        <ProfilePage />
      </StackNavigation.Entry>

      <StackNavigation.Entry value="settings">
        <SettingsPage />
      </StackNavigation.Entry>

      <StackNavigation.Trigger>
        {({ push, pop }) => (
          <div>
            <button onClick={() => push('profile')}>Go to Profile</button>
            <button onClick={() => pop()}>Go Back</button>
          </div>
        )}
      </StackNavigation.Trigger>
    </StackNavigation>
  );
}
```

### Dynamic Entry Rendering

```tsx
function App() {
  return (
    <StackNavigation initialStack={['home']}>
      <StackNavigation.DynamicEntry>
        {(currentEntry) => {
          switch (currentEntry) {
            case 'home':
              return <HomePage />;
            case 'profile':
              return <ProfilePage />;
            case 'settings':
              return <SettingsPage />;
          }
        }}
      </StackNavigation.DynamicEntry>
    </StackNavigation>
  );
}
```

### Using the Hook

```tsx
function NavigationButton() {
  const { push, pop, stack, popToTop, clear } = useStackNavigation();

  return (
    <div>
      <p>Current stack: {stack.join(' > ')}</p>
      <button onClick={() => push('settings')}>Settings</button>
      <button onClick={() => pop()}>Back</button>
      <button onClick={() => popToTop()}>To Top</button>
      <button onClick={() => clear()}>Clear All</button>
    </div>
  );
}
```

### Syncing with External State

```tsx
function App() {
  const [stack, setStack] = useState(['home']);

  return (
    <StackNavigation 
      initialStack={stack}
      onChangeStack={setStack}
    >
      {/* ... */}
    </StackNavigation>
  );
}
```

### Without Type Constraints

```tsx
const [StackNavigation, useStackNavigation] = createStackNavigation('AppStack');

// Now accepts any string
<StackNavigation.Entry value="any-string">
  <Component />
</StackNavigation.Entry>
```

## API

### `createStackNavigation<T>(displayName, options?)`

Creates a new stack navigation instance.

**Parameters:**
- `displayName`: String name for the navigation (used in error messages and DevTools)
- `options`: (Optional) Configuration object
  - `entries`: Readonly tuple of allowed entry values for type safety

**Returns:**
- `[StackNavigation, useStackNavigation]`: Tuple containing the component and hook

### `StackNavigation`

Root component that manages the stack state.

**Props:**
- `children`: React children (Entry, DynamicEntry, and Trigger components)
- `initialStack`: (Optional) Initial stack state (defaults to first entry if `entries` was provided)
- `onChangeStack`: (Optional) Callback fired whenever stack changes

### `StackNavigation.Entry`

Renders children only when this entry is at the top of the stack.

**Props:**
- `value`: Entry identifier (type-safe if `entries` was provided)
- `children`: Content to render when active
- `asChild`: (Optional) If true, renders children directly without wrapper div

### `StackNavigation.DynamicEntry`

Renders based on the current top entry with a render function.

**Props:**
- `children`: Render function that receives the current entry value

### `StackNavigation.Trigger`

Provides navigation functions via render props.

**Props:**
- `children`: Render function that receives `{ push, pop, clear }`

### `useStackNavigation()`

Hook to access navigation state and functions.

**Returns:**
- `stack`: Current stack array
- `push(entry)`: Add entry to top of stack
- `pop(count?)`: Remove entries from top (default: 1)
- `clear()`: Remove all entries from stack
- `popToTop()`: Remove all entries except the first one

## Real-World Examples

### Modal Stack

```tsx
const [ModalStack, useModalStack] = createStackNavigation(
  'ModalStack',
  { entries: ['confirm', 'edit', 'delete'] }
);

function App() {
  return (
    <ModalStack>
      <ModalStack.Entry value="confirm">
        <ConfirmModal />
      </ModalStack.Entry>
      <ModalStack.Entry value="edit">
        <EditModal />
      </ModalStack.Entry>
      <ModalStack.Entry value="delete">
        <DeleteModal />
      </ModalStack.Entry>
    </ModalStack>
  );
}
```

### Multi-Step Form

```tsx
const [FormStack] = createStackNavigation(
  'FormWizard',
  { entries: ['personal', 'address', 'payment', 'review'] }
);

function Wizard() {
  return (
    <FormStack initialStack={['personal']}>
      <FormStack.Entry value="personal">
        <PersonalInfoStep />
      </FormStack.Entry>
      <FormStack.Entry value="address">
        <AddressStep />
      </FormStack.Entry>
      <FormStack.Entry value="payment">
        <PaymentStep />
      </FormStack.Entry>
      <FormStack.Entry value="review">
        <ReviewStep />
      </FormStack.Entry>
    </FormStack>
  );
}
```

## License

MIT
