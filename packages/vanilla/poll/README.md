English | [한국어](./README.ko.md)

# @tstsx/poll

Robust polling utility with retry logic, custom intervals, and abort support.

## Why?

Polling asynchronous operations is a common pattern in web development, but implementing it correctly with retries, intervals, and error handling can be tricky. This library provides:

- **Automatic retries**: Configure maximum retry attempts for failed promises
- **Flexible intervals**: Use fixed delays or dynamic intervals based on attempt number
- **Conditional continuation**: Continue polling even on successful results based on custom logic
- **Abort support**: Cancel polling operations with AbortSignal
- **Result history**: Access complete history of all polling attempts
- **Type-safe**: Full TypeScript support with detailed type information

Perfect for: API polling, task status checks, health monitoring, progressive data loading, and asynchronous workflows.

## Installation

```bash
npm install @tstsx/poll
```

## Usage

### Basic Example

```typescript
import { poll } from '@tstsx/poll';

// Poll an API endpoint until it returns success
const result = await poll(
  async () => {
    const response = await fetch('/api/task/status');
    return response.json();
  },
  {
    interval: 1000,    // Wait 1 second between attempts
    retryCount: 5      // Retry up to 5 times on failure
  }
);

console.log(result.result); // Final successful result
console.log(result.history); // History of all attempts
```

### Conditional Continuation

```typescript
// Continue polling until task is complete
const { result } = await poll(
  async () => {
    const response = await fetch('/api/task/123');
    return response.json();
  },
  {
    interval: 2000,
    retryCount: 10,
    shouldContinue: (data) => data.status !== 'completed'
  }
);

console.log('Task completed:', result);
```

### Dynamic Intervals

```typescript
// Exponential backoff: 1s, 2s, 4s, 8s, ...
const { result } = await poll(
  fetchData,
  {
    interval: (attemptNumber) => Math.pow(2, attemptNumber) * 1000,
    retryCount: 5
  }
);
```

### Abort Support

```typescript
const controller = new AbortController();

// Cancel after 30 seconds
setTimeout(() => controller.abort(), 30000);

try {
  const { result } = await poll(
    fetchData,
    {
      signal: controller.signal,
      interval: 1000,
      retryCount: 100
    }
  );
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Polling was cancelled');
  }
}
```

### Error Handling

```typescript
import { PollError } from '@tstsx/poll';

try {
  const { result } = await poll(
    fetchData,
    {
      interval: 1000,
      retryCount: 3
    }
  );
} catch (error) {
  if (error instanceof PollError) {
    console.log('Polling failed after all retries');
    console.log('Attempt history:', error.results);
    // error.results contains all attempts:
    // [[error1, null], [error2, null], [null, success], ...]
  }
}
```

## API

### `poll(promise, options?)`

Executes a promise repeatedly with retry logic and interval delays.

**Parameters:**
- `promise`: Function returning a Promise to execute
- `options`: (Optional) Configuration object

**Returns:**
- `Promise<{ result: T, history: ResultHistory<T> }>`

**Throws:**
- `PollError`: When maximum retry count is reached
- `AbortError`: When polling is cancelled via AbortSignal

### Options

```typescript
type Options<T> = {
  // Interval to wait before next attempt (ms)
  interval?: number | ((attemptNumber: number) => number);
  
  // Maximum number of retries on failure (default: 5)
  retryCount?: number;
  
  // Function to determine if polling should continue (default: always stop on success)
  shouldContinue?: (result: T) => boolean;
  
  // Signal to abort polling
  signal?: AbortSignal;
};
```

### Result Types

```typescript
type SuccessResult<T> = [null, T];
type FailResult = [unknown, null];
type ResultHistory<T> = ReadonlyArray<SuccessResult<T> | FailResult>;

type Result<T> = {
  result: T;              // Final successful result
  history: ResultHistory<T>; // All attempt results
};
```

### PollError

```typescript
class PollError<T> extends Error {
  readonly results: ResultHistory<T>; // All attempt results
}
```

## Real-World Examples

### API Task Status Polling

```typescript
async function waitForTaskCompletion(taskId: string) {
  try {
    const { result } = await poll(
      async () => {
        const response = await fetch(`/api/tasks/${taskId}`);
        return response.json();
      },
      {
        interval: 2000,
        retryCount: 30,
        shouldContinue: (task) => task.status === 'pending' || task.status === 'running'
      }
    );
    
    return result;
  } catch (error) {
    if (error instanceof PollError) {
      console.error('Task did not complete in time');
    }
    throw error;
  }
}
```

### Health Check with Exponential Backoff

```typescript
async function waitForServiceHealth(serviceUrl: string) {
  const { result } = await poll(
    async () => {
      const response = await fetch(`${serviceUrl}/health`);
      if (!response.ok) throw new Error('Service unhealthy');
      return response.json();
    },
    {
      interval: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000), // Max 30s
      retryCount: 10
    }
  );
  
  return result;
}
```

### Form Submission with Retry

```typescript
async function submitFormWithRetry(formData: FormData, abortSignal?: AbortSignal) {
  try {
    const { result, history } = await poll(
      async () => {
        const response = await fetch('/api/submit', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return response.json();
      },
      {
        interval: 3000,
        retryCount: 3,
        signal: abortSignal
      }
    );
    
    console.log(`Submission succeeded after ${history.length} attempts`);
    return result;
  } catch (error) {
    if (error instanceof PollError) {
      // Show user-friendly error after all retries failed
      showError('Submission failed. Please try again later.');
    }
    throw error;
  }
}
```

### WebSocket Connection Retry

```typescript
async function connectWithRetry(url: string) {
  const { result } = await poll(
    () => new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      
      ws.onopen = () => resolve(ws);
      ws.onerror = (error) => reject(error);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    }),
    {
      interval: (attempt) => 1000 * (attempt + 1), // Linear backoff
      retryCount: 5
    }
  );
  
  return result;
}
```

### Progressive Data Loading

```typescript
async function loadAllPages(baseUrl: string) {
  const allData: any[] = [];
  let page = 1;
  
  await poll(
    async () => {
      const response = await fetch(`${baseUrl}?page=${page}`);
      const data = await response.json();
      
      allData.push(...data.items);
      page++;
      
      return data;
    },
    {
      interval: 500,
      retryCount: 3,
      shouldContinue: (data) => data.hasMore
    }
  );
  
  return allData;
}
```

## License

MIT
