English | [한국어](./README.ko.md)

# @tstsx/preventable

Intercept and conditionally prevent function execution with a flexible event-based API.

## Why?

Sometimes you need to add pre-execution hooks to functions without modifying their core logic. This library provides:

- **Event-based interception**: Add multiple handlers that execute before the original function
- **Conditional prevention**: Stop function execution based on dynamic conditions
- **Parameter access**: Read and modify parameters passed to the original function
- **Async support**: Works seamlessly with both sync and async functions
- **Type-safe**: Full TypeScript support with preserved function signatures

Perfect for: validation hooks, authorization checks, logging, analytics, form submission control, and conditional behavior.

## Installation

```bash
npm install @tstsx/preventable
```

## Usage

### Basic Example

```typescript
import { preventable } from '@tstsx/preventable';

const submitForm = (data: FormData) => {
  console.log('Submitting:', data);
};

const wrappedSubmit = preventable(submitForm, [
  (event) => {
    if (!event.params[0].has('email')) {
      event.preventDefault();
      console.log('Email is required');
    }
  }
]);

wrappedSubmit(new FormData()); // Logs "Email is required", doesn't submit
```

### Multiple Handlers

```typescript
const saveData = (data: any) => {
  console.log('Saving:', data);
};

const wrappedSave = preventable(saveData, [
  (event) => {
    console.log('Handler 1: Logging attempt');
  },
  (event) => {
    if (event.params[0].invalid) {
      event.preventDefault();
      console.log('Handler 2: Data is invalid');
    }
  },
  (event) => {
    console.log('Handler 3: Still runs even if prevented');
  }
]);

wrappedSave({ invalid: true });
// Logs:
// "Handler 1: Logging attempt"
// "Handler 2: Data is invalid"
// "Handler 3: Still runs even if prevented"
// saveData is NOT called
```

### Async Functions

```typescript
const saveToDatabase = async (user: User) => {
  await db.users.insert(user);
};

const wrappedSave = preventable(saveToDatabase, [
  async (event) => {
    const user = event.params[0];
    const exists = await db.users.findByEmail(user.email);
    
    if (exists) {
      event.preventDefault();
      throw new Error('User already exists');
    }
  }
]);

await wrappedSave({ email: 'user@example.com', name: 'John' });
```

### Custom Parameters

```typescript
const logMessage = (message: string) => {
  console.log('Message:', message);
};

const wrappedLog = preventable(logMessage, [
  (event) => {
    // Call the original function with modified parameters
    event.default(`[${new Date().toISOString()}] ${event.params[0]}`);
    event.preventDefault(); // Prevent calling with original params
  }
]);

wrappedLog('Hello');
// Logs: "Message: [2024-01-01T00:00:00.000Z] Hello"
```

### Checking Prevention State

```typescript
const processData = (data: any) => {
  console.log('Processing:', data);
};

const wrappedProcess = preventable(processData, [
  (event) => {
    console.log('Handler 1');
  },
  (event) => {
    if (event.params[0].shouldPrevent) {
      event.preventDefault();
    }
  },
  (event) => {
    // Check if already prevented
    if (event.defaultPrevented) {
      console.log('Already prevented, skipping validation');
      return;
    }
    // Additional validation...
  }
]);
```

## API

### `preventable(defaultAction, handlers)`

Creates a wrapper function that executes handlers before the original function.

**Parameters:**
- `defaultAction`: The function to wrap (sync or async)
- `handlers`: Array of handler functions to execute before `defaultAction`

**Returns:**
- A function with the same signature as `defaultAction`

### Event Object

Each handler receives an event object with the following properties:

```typescript
type Event<T> = {
  // Whether preventDefault() has been called
  defaultPrevented: boolean;
  
  // Parameters passed to the wrapped function
  params: Parameters<T>;
  
  // Call the original function (optionally with different params)
  default: T;
  
  // Prevent the original function from executing
  preventDefault: () => void;
};
```

### Handler Function

```typescript
type EventHandler<T> = (event: Event<T>) => void | Promise<void>;
```

## Real-World Examples

### Form Validation

```typescript
function LoginForm() {
  const handleSubmit = preventable(
    async (email: string, password: string) => {
      await loginUser(email, password);
    },
    [
      (event) => {
        const [email, password] = event.params;
        
        if (!email || !password) {
          event.preventDefault();
          showError('Email and password are required');
        }
      },
      (event) => {
        const [email] = event.params;
        
        if (!email.includes('@')) {
          event.preventDefault();
          showError('Invalid email format');
        }
      }
    ]
  );
  
  return <form onSubmit={() => handleSubmit(email, password)}>...</form>;
}
```

### Authorization Checks

```typescript
const deleteUser = preventable(
  async (userId: string) => {
    await api.users.delete(userId);
  },
  [
    async (event) => {
      const currentUser = await getCurrentUser();
      
      if (!currentUser.isAdmin) {
        event.preventDefault();
        throw new Error('Unauthorized: Admin access required');
      }
    }
  ]
);
```

### Analytics & Logging

```typescript
const trackEvent = (eventName: string, data: any) => {
  analytics.track(eventName, data);
};

const wrappedTrack = preventable(trackEvent, [
  (event) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics:', event.params);
    }
  },
  (event) => {
    // Don't track in test environments
    if (process.env.NODE_ENV === 'test') {
      event.preventDefault();
    }
  }
]);
```

### Rate Limiting

```typescript
const apiCall = preventable(
  async (endpoint: string) => {
    return await fetch(endpoint);
  },
  [
    async (event) => {
      const [endpoint] = event.params;
      const canProceed = await rateLimiter.check(endpoint);
      
      if (!canProceed) {
        event.preventDefault();
        throw new Error('Rate limit exceeded');
      }
    }
  ]
);
```

## License

MIT
