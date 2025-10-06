# @tstsx/object-diff

Deep object comparison utility with advanced configuration options.

## Why?

Comparing objects in JavaScript is notoriously tricky. This library provides:

- **Deep comparison**: Recursively compares nested objects and arrays
- **Detailed diff output**: Know exactly what changed, where it changed, and how
- **Flexible configuration**: Ignore paths, types, handle circular references, and custom comparisons
- **Type-safe**: Full TypeScript support with detailed type information
- **Performance**: Efficient traversal with depth limiting and circular reference detection

Perfect for: state management, change tracking, debugging, testing, form validation, and audit logging.

## Installation

```bash
npm install @tstsx/object-diff
```

## Usage

### Basic Example

```typescript
import { objectDiff } from '@tstsx/object-diff';

const before = {
  name: 'John',
  age: 30,
  address: {
    city: 'NYC',
    zip: '10001'
  }
};

const after = {
  name: 'John',
  age: 31,
  address: {
    city: 'Boston',
    zip: '10001'
  }
};

const diffs = objectDiff(before, after);
console.log(diffs);
// [
//   { type: 'updated', path: ['age'], oldValue: 30, newValue: 31 },
//   { type: 'updated', path: ['address', 'city'], oldValue: 'NYC', newValue: 'Boston' }
// ]
```

### Detecting Additions and Deletions

```typescript
const before = { a: 1, b: 2 };
const after = { a: 1, c: 3 };

const diffs = objectDiff(before, after);
// [
//   { type: 'deleted', path: ['b'], value: 2 },
//   { type: 'added', path: ['c'], value: 3 }
// ]
```

### Ignoring Paths

```typescript
const before = { name: 'John', age: 30, updatedAt: '2024-01-01' };
const after = { name: 'John', age: 31, updatedAt: '2024-01-02' };

const diffs = objectDiff(before, after, {
  ignorePaths: ['updatedAt']
});
// Only age change is reported, updatedAt is ignored
```

### Ignoring Types

```typescript
const before = { 
  name: 'John', 
  handler: () => console.log('old'),
  config: { enabled: true }
};

const after = { 
  name: 'Jane', 
  handler: () => console.log('new'),
  config: { enabled: false }
};

const diffs = objectDiff(before, after, {
  ignoreTypes: ['function']
});
// Only name and config.enabled changes are reported
```

### Custom Comparisons

```typescript
const before = { createdAt: new Date('2024-01-01') };
const after = { createdAt: new Date('2024-01-01') };

const diffs = objectDiff(before, after, {
  compareWith: {
    'createdAt': (left, right) => {
      // Custom date comparison
      return left instanceof Date && 
             right instanceof Date && 
             left.getTime() === right.getTime();
    }
  }
});
// No diffs - dates are considered equal
```

### Handling Circular References

```typescript
const obj1: any = { a: 1 };
obj1.self = obj1;

const obj2: any = { a: 1 };
obj2.self = obj2;

// Default: Mark circular refs
const diffs1 = objectDiff(obj1, obj2, { circularRefs: 'mark' });

// Ignore circular refs
const diffs2 = objectDiff(obj1, obj2, { circularRefs: 'ignore' });

// Throw error on circular refs
try {
  objectDiff(obj1, obj2, { circularRefs: 'error' });
} catch (e) {
  console.error('Circular reference detected!');
}
```

### Limiting Depth

```typescript
const deeply = {
  level1: {
    level2: {
      level3: {
        level4: {
          value: 'deep'
        }
      }
    }
  }
};

const diffs = objectDiff(deeply, {}, { maxDepth: 2 });
// Only compares up to level2, ignores level3 and deeper
```

## API

### `objectDiff(left, right, options?)`

Compares two values and returns an array of differences.

**Parameters:**
- `left`: First value to compare
- `right`: Second value to compare
- `options`: (Optional) Configuration object

**Returns:**
- `Diff[]`: Array of difference objects

### Options

```typescript
type DiffOptions = {
  // Ignore specific paths (e.g., ['user.password', 'metadata'])
  ignorePaths?: string[];
  
  // Ignore specific types (e.g., ['function', 'symbol'])
  ignoreTypes?: Array<'function' | 'symbol' | 'undefined'>;
  
  // Custom comparison functions for specific paths
  compareWith?: Record<string, (left: unknown, right: unknown) => boolean>;
  
  // How to handle circular references: 'ignore' | 'mark' | 'error'
  circularRefs?: 'ignore' | 'mark' | 'error';
  
  // Maximum depth to traverse (default: Infinity)
  maxDepth?: number;
};
```

### Diff Types

```typescript
type ValueDiff = {
  type: 'added' | 'deleted';
  path: string[];
  value: unknown;
};

type UpdateDiff = {
  type: 'updated';
  path: string[];
  oldValue: unknown;
  newValue: unknown;
};

type Diff = ValueDiff | UpdateDiff;
```

## Real-World Examples

### Form Change Tracking

```typescript
function FormEditor({ initialData }) {
  const [data, setData] = useState(initialData);
  
  const changes = objectDiff(initialData, data, {
    ignorePaths: ['metadata.lastModified']
  });
  
  const hasChanges = changes.length > 0;
  
  return (
    <div>
      <form>...</form>
      <button disabled={!hasChanges}>Save Changes</button>
      {hasChanges && <div>{changes.length} changes pending</div>}
    </div>
  );
}
```

### Audit Logging

```typescript
function saveUser(userId, oldData, newData) {
  const diffs = objectDiff(oldData, newData, {
    ignorePaths: ['password', 'sessionToken'],
    ignoreTypes: ['function']
  });
  
  if (diffs.length > 0) {
    logAuditEvent({
      userId,
      action: 'USER_UPDATE',
      changes: diffs.map(d => ({
        field: d.path.join('.'),
        before: 'oldValue' in d ? d.oldValue : null,
        after: 'newValue' in d ? d.newValue : 'value' in d ? d.value : null
      }))
    });
  }
}
```

### State Debugging

```typescript
function useDebugState(name, state) {
  const prevState = useRef(state);
  
  useEffect(() => {
    const diffs = objectDiff(prevState.current, state);
    if (diffs.length > 0) {
      console.group(`[${name}] State changed`);
      diffs.forEach(diff => {
        console.log(diff.path.join('.'), diff);
      });
      console.groupEnd();
    }
    prevState.current = state;
  }, [state]);
}
```

## License

MIT
