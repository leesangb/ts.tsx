# @tstsx/collections

효율적인 객체 비교를 위한 해시 함수를 지원하는 커스텀 자료구조입니다.

## 특징

- **HashMap**: 복잡한 키를 위한 커스텀 해시 함수를 지원하는 Map 구현체
- **HashSet**: 복잡한 값을 위한 커스텀 해시 함수를 지원하는 Set 구현체
- **커스텀 해시 함수**: 객체와 복잡한 타입에 대한 고유한 동등성 로직 정의
- **타입 안정성**: 제네릭 타입을 통한 완전한 TypeScript 지원
- **반복자 지원**: for...of 루프 및 전개 연산자와 함께 작동

## 설치

```bash
npm install @tstsx/collections
```

## 사용법

### HashMap

커스텀 동등성 로직을 사용하여 객체나 복잡한 타입을 키로 사용해야 할 때 HashMap을 사용하세요.

#### 기본 사용법

```typescript
import { HashMap } from '@tstsx/collections';

const map = new HashMap<string, number>();
map.set('foo', 1);
map.set('bar', 2);

console.log(map.get('foo')); // 1
console.log(map.has('bar')); // true
console.log(map.size); // 2
```

#### 커스텀 해시 함수 사용

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
userMap.set(user3, 'super-admin'); // user1을 덮어씀 (같은 id)

console.log(userMap.get(user1)); // 'super-admin'
console.log(userMap.size); // 2
```

#### 반복

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

커스텀 동등성 로직을 사용하여 고유한 값을 저장해야 할 때 HashSet을 사용하세요.

#### 기본 사용법

```typescript
import { HashSet } from '@tstsx/collections';

const set = new HashSet<string>();
set.add('foo');
set.add('bar');
set.add('foo'); // 무시됨 (중복)

console.log(set.has('foo')); // true
console.log(set.size); // 2
```

#### 커스텀 해시 함수 사용

```typescript
import { HashSet } from '@tstsx/collections';

type Point = { x: number; y: number };

const points = new HashSet<Point>({
  getHash: (point) => `${point.x},${point.y}`,
});

const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
const p3 = { x: 1, y: 2 }; // p1과 같은 좌표

points.add(p1);
points.add(p2);
points.add(p3); // 무시됨 (p1과 같은 해시)

console.log(points.size); // 2
console.log(points.has(p1)); // true
console.log(points.has(p3)); // true (같은 해시)
```

#### 반복

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

#### 생성자

```typescript
new HashMap<K, V>(options?: { getHash?: (key: K) => string | number | K })
```

선택적 해시 함수와 함께 새 HashMap을 생성합니다. 해시 함수가 제공되지 않으면 키는 참조로 비교됩니다.

#### 메서드

- `get(key: K): V | undefined` - 주어진 키에 대한 값을 반환합니다
- `set(key: K, value: V): this` - 키-값 쌍을 설정합니다
- `has(key: K): boolean` - 키가 존재하는지 확인합니다
- `delete(key: K): boolean` - 키-값 쌍을 삭제합니다
- `clear(): void` - 모든 항목을 제거합니다
- `keys(): IterableIterator<K>` - 키의 반복자를 반환합니다
- `values(): IterableIterator<V>` - 값의 반복자를 반환합니다
- `entries(): IterableIterator<[K, V]>` - 키-값 쌍의 반복자를 반환합니다
- `forEach(callback: (value: V, key: K, map: this) => void, thisArg?: any): void` - 각 항목에 대해 함수를 실행합니다

#### 속성

- `size: number` - 맵의 항목 수

### HashSet

#### 생성자

```typescript
new HashSet<T>(options?: { getHash?: (value: T) => string | number | T })
```

선택적 해시 함수와 함께 새 HashSet을 생성합니다. 해시 함수가 제공되지 않으면 값은 참조로 비교됩니다.

#### 메서드

- `add(value: T): this` - 세트에 값을 추가합니다
- `has(value: T): boolean` - 값이 존재하는지 확인합니다
- `delete(value: T): boolean` - 값을 삭제합니다
- `clear(): void` - 모든 값을 제거합니다
- `values(): IterableIterator<T>` - 값의 반복자를 반환합니다

#### 속성

- `size: number` - 세트의 값 개수

## 실제 사용 예제

### 요청 매개변수별 API 응답 캐싱

```typescript
type Request = { url: string; method: string; body?: any };

const cache = new HashMap<Request, Response>({
  getHash: (req) => `${req.method}:${req.url}:${JSON.stringify(req.body)}`,
});

const req1 = { url: '/api/users', method: 'GET' };
const req2 = { url: '/api/users', method: 'POST', body: { name: 'Alice' } };

cache.set(req1, response1);
cache.set(req2, response2);

console.log(cache.get(req1)); // 캐시된 응답 반환
```

### 고유 방문자 추적

```typescript
type Visitor = { ip: string; userAgent: string };

const uniqueVisitors = new HashSet<Visitor>({
  getHash: (v) => `${v.ip}:${v.userAgent}`,
});

uniqueVisitors.add({ ip: '192.168.1.1', userAgent: 'Chrome' });
uniqueVisitors.add({ ip: '192.168.1.1', userAgent: 'Chrome' }); // 무시됨
uniqueVisitors.add({ ip: '192.168.1.2', userAgent: 'Firefox' });

console.log(uniqueVisitors.size); // 2
```

### ID로 객체 중복 제거

```typescript
type Product = { id: string; name: string; price: number };

const products = new HashSet<Product>({
  getHash: (p) => p.id,
});

const rawData = [
  { id: '1', name: 'Laptop', price: 1000 },
  { id: '2', name: 'Mouse', price: 25 },
  { id: '1', name: 'Laptop Pro', price: 1200 }, // 중복 ID
];

rawData.forEach((p) => products.add(p));
console.log(products.size); // 2 (중복 제거됨)
```

### 복잡한 키로 항목 그룹화

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

## 라이선스

MIT
