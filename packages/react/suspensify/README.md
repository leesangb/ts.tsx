# @tstsx/suspensify

Convert promises into Suspense-compatible resources for React.

## Installation

```bash
npm install @tstsx/suspensify
```

Or as part of the unified package:

```bash
npm install @tstsx
```

## Usage

### Basic Example

```tsx
import { Suspense } from 'react';
import { suspensify } from '@tstsx/suspensify';

const fetchUser = suspensify(fetch('/api/user').then(r => r.json()));

function UserProfile() {
  const user = fetchUser();
  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile />
    </Suspense>
  );
}
```

### How It Works

`suspensify` wraps a promise and returns a function that:
- Throws the promise when still pending (React Suspense catches this)
- Returns the resolved value when successful
- Throws the error if the promise rejected

This allows you to write synchronous-looking code that integrates seamlessly with React Suspense.

## API

### `suspensify<T>(promise: Promise<T>): () => T`

Converts a Promise into a Suspense-compatible resource.

**Parameters:**
- `promise` - The promise to convert into a Suspense resource

**Returns:**
- A function that returns the resolved value when called

**Throws:**
- The original promise if still pending (caught by React Suspense)
- The error if the promise rejected

## Example with Data Fetching

```tsx
import { Suspense } from 'react';
import { suspensify } from '@tstsx/suspensify';

async function fetchPosts() {
  const response = await fetch('/api/posts');
  return response.json();
}

const getPosts = suspensify(fetchPosts());

function PostList() {
  const posts = getPosts();
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <PostList />
    </Suspense>
  );
}
```

## Use with @tstsx/init

The `suspensify` utility is used internally by [@tstsx/init](../init) for async component initialization. If you need higher-level async initialization patterns, check out the `withInitializer` HOC.

## License

MIT
