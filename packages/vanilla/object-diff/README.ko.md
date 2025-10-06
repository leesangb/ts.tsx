[English](./README.md) | 한국어

# @tstsx/object-diff

고급 설정 옵션을 제공하는 깊은 객체 비교 유틸리티.

## 왜 사용하나요?

JavaScript에서 객체를 비교하는 것은 악명 높게 까다롭습니다. 이 라이브러리는 다음을 제공합니다:

- **깊은 비교**: 중첩된 객체와 배열을 재귀적으로 비교
- **상세한 차이 출력**: 무엇이, 어디서, 어떻게 변경되었는지 정확히 파악
- **유연한 설정**: 경로 무시, 타입 무시, 순환 참조 처리, 사용자 정의 비교
- **타입 안전**: 상세한 타입 정보와 완전한 TypeScript 지원
- **성능**: 깊이 제한과 순환 참조 감지를 통한 효율적인 탐색

상태 관리, 변경 추적, 디버깅, 테스팅, 폼 검증, 감사 로깅에 완벽합니다.

## 설치

```bash
npm install @tstsx/object-diff
```

## 사용법

### 기본 예제

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

### 추가 및 삭제 감지

```typescript
const before = { a: 1, b: 2 };
const after = { a: 1, c: 3 };

const diffs = objectDiff(before, after);
// [
//   { type: 'deleted', path: ['b'], value: 2 },
//   { type: 'added', path: ['c'], value: 3 }
// ]
```

### 경로 무시

```typescript
const before = { name: 'John', age: 30, updatedAt: '2024-01-01' };
const after = { name: 'John', age: 31, updatedAt: '2024-01-02' };

const diffs = objectDiff(before, after, {
  ignorePaths: ['updatedAt']
});
// age 변경만 보고되고, updatedAt은 무시됨
```

### 타입 무시

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
// name과 config.enabled 변경만 보고됨
```

### 사용자 정의 비교

```typescript
const before = { createdAt: new Date('2024-01-01') };
const after = { createdAt: new Date('2024-01-01') };

const diffs = objectDiff(before, after, {
  compareWith: {
    'createdAt': (left, right) => {
      // 사용자 정의 날짜 비교
      return left instanceof Date && 
             right instanceof Date && 
             left.getTime() === right.getTime();
    }
  }
});
// 차이 없음 - 날짜가 동일한 것으로 간주됨
```

### 순환 참조 처리

```typescript
const obj1: any = { a: 1 };
obj1.self = obj1;

const obj2: any = { a: 1 };
obj2.self = obj2;

// 기본값: 순환 참조 표시
const diffs1 = objectDiff(obj1, obj2, { circularRefs: 'mark' });

// 순환 참조 무시
const diffs2 = objectDiff(obj1, obj2, { circularRefs: 'ignore' });

// 순환 참조 시 에러 발생
try {
  objectDiff(obj1, obj2, { circularRefs: 'error' });
} catch (e) {
  console.error('순환 참조 감지!');
}
```

### 깊이 제한

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
// level2까지만 비교하고, level3 이하는 무시
```

## API

### `objectDiff(left, right, options?)`

두 값을 비교하고 차이점 배열을 반환합니다.

**매개변수:**
- `left`: 비교할 첫 번째 값
- `right`: 비교할 두 번째 값
- `options`: (선택사항) 설정 객체

**반환값:**
- `Diff[]`: 차이 객체 배열

### 옵션

```typescript
type DiffOptions = {
  // 특정 경로 무시 (예: ['user.password', 'metadata'])
  ignorePaths?: string[];
  
  // 특정 타입 무시 (예: ['function', 'symbol'])
  ignoreTypes?: Array<'function' | 'symbol' | 'undefined'>;
  
  // 특정 경로에 대한 사용자 정의 비교 함수
  compareWith?: Record<string, (left: unknown, right: unknown) => boolean>;
  
  // 순환 참조 처리 방법: 'ignore' | 'mark' | 'error'
  circularRefs?: 'ignore' | 'mark' | 'error';
  
  // 탐색할 최대 깊이 (기본값: Infinity)
  maxDepth?: number;
};
```

### 차이 타입

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

## 실제 사용 예제

### 폼 변경 추적

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
      <button disabled={!hasChanges}>변경사항 저장</button>
      {hasChanges && <div>{changes.length}개의 변경사항 대기 중</div>}
    </div>
  );
}
```

### 감사 로깅

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

### 상태 디버깅

```typescript
function useDebugState(name, state) {
  const prevState = useRef(state);
  
  useEffect(() => {
    const diffs = objectDiff(prevState.current, state);
    if (diffs.length > 0) {
      console.group(`[${name}] 상태 변경됨`);
      diffs.forEach(diff => {
        console.log(diff.path.join('.'), diff);
      });
      console.groupEnd();
    }
    prevState.current = state;
  }, [state]);
}
```

## 라이선스

MIT
