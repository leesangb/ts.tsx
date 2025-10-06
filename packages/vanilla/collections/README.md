# @tstsx/collections

Custom data structures with hash function support for efficient object comparison.

## Features

- **HashMap**: Map implementation with custom hash functions for complex keys
- **HashSet**: Set implementation with custom hash functions for complex values
- **Custom Hash Functions**: Define your own equality logic for objects and complex types
- **Type-Safe**: Full TypeScript support with generic types
- **Iterator Support**: Works with for...of loops and spread operators

## Installation

```bash
npm install @tstsx/collections
```

## Usage

### HashMap

Use HashMap when you need to use objects or complex types as keys with custom equality logic.

#### Basic Usage

```typescript
import { HashMap } from '@tstsx/collections';

const map = new HashMap<string, number>();
map.set('foo', 1);
map.set('bar', 2);

console.log(map.get('foo')); // 1
console.log(map.has('bar')); // true
console.log(map.size); // 2
```

#### With Custom Hash Function

```typescript
import { HashMap } from '@tstsx/collections';

type User = { id: number; name: string };

const userMap = new HashMap<User, string>({
  getHash: (user) => user.id,
});

const user1 = { id: 1, name: 'Alice' };
const user2 = { id: 2, name: 'Bob' };
const user3 = { id: 1, name: 'Alice Updated' };

userMap.set(user1, 'admin');
userMap.set(user2, 'user');
userMap.set(user3, 'super-admin'); // Overwrites user1 (same id)

console.log(userMap.get(user1)); // 'super-admin'
console.log(userMap.size); // 2
```

#### Iteration

```typescript
const map = new HashMap<string, number>();
map.set('a', 1);
map.set('b', 2);

for (const [key, value] of map) {
  console.log(key, value);
}

Array.from(map.keys()); // ['a', 'b']
Array.from(map.values()); // [1, 2]
Array.from(map.entries()); // [['a', 1], ['b', 2]]

map.forEach((value, key) => {
  console.log(key, value);
});
```

### HashSet

Use HashSet when you need to store unique values with custom equality logic.

#### Basic Usage

```typescript
import { HashSet } from '@tstsx/collections';

const set = new HashSet<string>();
set.add('foo');
set.add('bar');
set.add('foo'); // Ignored (duplicate)

console.log(set.has('foo')); // true
console.log(set.size); // 2
```

#### With Custom Hash Function

```typescript
import { HashSet } from '@tstsx/collections';

type Point = { x: number; y: number };

const points = new HashSet<Point>({
  getHash: (point) => `${point.x},${point.y}`,
});

const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
const p3 = { x: 1, y: 2 }; // Same coordinates as p1

points.add(p1);
points.add(p2);
points.add(p3); // Ignored (same hash as p1)

console.log(points.size); // 2
console.log(points.has(p1)); // true
console.log(points.has(p3)); // true (same hash)
```

#### Iteration

```typescript
const set = new HashSet<string>();
set.add('a');
set.add('b');

for (const value of set) {
  console.log(value);
}

Array.from(set); // ['a', 'b']
Array.from(set.values()); // ['a', 'b']
```

## API

### HashMap

#### Constructor

```typescript
new HashMap<K, V>(options?: { getHash?: (key: K) => string | number | K })
```

Creates a new HashMap with an optional hash function. If no hash function is provided, keys are compared by reference.

#### Methods

- `get(key: K): V | undefined` - Returns the value for the given key
- `set(key: K, value: V): this` - Sets a key-value pair
- `has(key: K): boolean` - Checks if a key exists
- `delete(key: K): boolean` - Deletes a key-value pair
- `clear(): void` - Removes all entries
- `keys(): IterableIterator<K>` - Returns an iterator of keys
- `values(): IterableIterator<V>` - Returns an iterator of values
- `entries(): IterableIterator<[K, V]>` - Returns an iterator of key-value pairs
- `forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void` - Executes a function for each entry

#### Properties

- `size: number` - The number of entries in the map

### HashSet

#### Constructor

```typescript
new HashSet<T>(options?: { getHash?: (value: T) => string | number | T })
```

Creates a new HashSet with an optional hash function. If no hash function is provided, values are compared by reference.

#### Methods

- `add(value: T): this` - Adds a value to the set
- `has(value: T): boolean` - Checks if a value exists
- `delete(value: T): boolean` - Deletes a value
- `clear(): void` - Removes all values
- `values(): IterableIterator<T>` - Returns an iterator of values

#### Properties

- `size: number` - The number of values in the set

## Real-World Examples

### Caching API Responses by Request Parameters

```typescript
type Request = { url: string; method: string; body?: any };

const cache = new HashMap<Request, Response>({
  getHash: (req) => `${req.method}:${req.url}:${JSON.stringify(req.body)}`,
});

const req1 = { url: '/api/users', method: 'GET' };
const req2 = { url: '/api/users', method: 'POST', body: { name: 'Alice' } };

cache.set(req1, response1);
cache.set(req2, response2);

console.log(cache.get(req1)); // Returns cached response
```

### Tracking Unique Visitors

```typescript
type Visitor = { ip: string; userAgent: string };

const uniqueVisitors = new HashSet<Visitor>({
  getHash: (v) => `${v.ip}:${v.userAgent}`,
});

uniqueVisitors.add({ ip: '192.168.1.1', userAgent: 'Chrome' });
uniqueVisitors.add({ ip: '192.168.1.1', userAgent: 'Chrome' }); // Ignored
uniqueVisitors.add({ ip: '192.168.1.2', userAgent: 'Firefox' });

console.log(uniqueVisitors.size); // 2
```

### Deduplicating Objects by ID

```typescript
type Product = { id: string; name: string; price: number };

const products = new HashSet<Product>({
  getHash: (p) => p.id,
});

const rawData = [
  { id: '1', name: 'Laptop', price: 1000 },
  { id: '2', name: 'Mouse', price: 25 },
  { id: '1', name: 'Laptop Pro', price: 1200 }, // Duplicate ID
];

rawData.forEach((p) => products.add(p));
console.log(products.size); // 2 (duplicate removed)
```

### Grouping Items with Complex Keys

```typescript
type TimeRange = { start: Date; end: Date };

const schedules = new HashMap<TimeRange, string[]>({
  getHash: (range) => `${range.start.getTime()}-${range.end.getTime()}`,
});

const morning = { start: new Date('2025-01-01 09:00'), end: new Date('2025-01-01 12:00') };
const afternoon = { start: new Date('2025-01-01 13:00'), end: new Date('2025-01-01 17:00') };

schedules.set(morning, ['Meeting', 'Code Review']);
schedules.set(afternoon, ['Development', 'Testing']);

console.log(schedules.get(morning)); // ['Meeting', 'Code Review']
```

## License

MIT
