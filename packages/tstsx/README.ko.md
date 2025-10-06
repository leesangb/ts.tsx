# tstsx

React와 TypeScript 애플리케이션을 위한 타입 안전 유틸리티 모음입니다.

## 왜 사용하나요?

각 패키지를 개별적으로 설치하는 대신, `tstsx`는 자동 트리 쉐이킹을 지원하는 단일 설치 지점을 제공합니다. 필요한 것만 import하면 번들러가 자동으로 사용하지 않는 코드를 제외합니다.

## 설치

전체 컬렉션 또는 개별 패키지를 설치할 수 있습니다:

```bash
# 모든 유틸리티 설치
npm install tstsx

# 또는 개별 패키지 설치
npm install @tstsx/combined
npm install @tstsx/exception-boundary
npm install @tstsx/init
npm install @tstsx/suspensify
npm install @tstsx/stack-navigation
npm install @tstsx/collections
npm install @tstsx/object-diff
npm install @tstsx/poll
npm install @tstsx/preventable
```

## 사용법

최적의 트리 쉐이킹을 위해 `tstsx`에서 특정 서브 경로로 import하세요:

```tsx
// React 유틸리티
import { Combined } from 'tstsx/combined';
import { createExceptionBoundary } from 'tstsx/exception-boundary';
import { withInitializer } from 'tstsx/init';
import { suspensify } from 'tstsx/suspensify';
import { createStackNavigation } from 'tstsx/stack-navigation';

// Vanilla 유틸리티
import { HashMap, HashSet } from 'tstsx/collections';
import { objectDiff } from 'tstsx/object-diff';
import { poll } from 'tstsx/poll';
import { preventable } from 'tstsx/preventable';
```

또는 개별 패키지에서 import하세요:

```tsx
import { Combined } from '@tstsx/combined';
import { createExceptionBoundary } from '@tstsx/exception-boundary';
import { HashMap, HashSet } from '@tstsx/collections';
import { poll } from '@tstsx/poll';
```

## 패키지

### React 유틸리티

#### Combined

깔끔하고 타입 안전한 API로 여러 React 컴포넌트를 합성합니다.

```tsx
import { Combined } from 'tstsx/combined';

<Combined
  components={[
    [Provider1, { value: 'test' }],
    [Provider2, { count: 42 }],
  ]}>
  <ChildComponent />
</Combined>
```

[전체 문서](../react/combined/README.ko.md)

#### Exception Boundary

선언적 에러 처리를 지원하는 타입 안전 예외 경계입니다.

```tsx
import { createExceptionBoundary } from 'tstsx/exception-boundary';

type AppException =
  | { type: 'network-error'; message: string }
  | { type: 'not-found'; resource: string };

const [ExceptionBoundary, useExceptionBoundary] = 
  createExceptionBoundary<AppException>('AppExceptionBoundary');
```

[전체 문서](../react/exception-boundary/README.ko.md)

#### Init

Suspense와 함께 비동기 초기화를 처리하는 React HOC입니다.

```tsx
import { withInitializer } from 'tstsx/init';

const Component = withInitializer(MyComponent, fetchData);
```

[전체 문서](../react/init/README.ko.md)

#### Suspensify

Promise를 Suspense 호환 리소스로 변환합니다.

```tsx
import { suspensify } from 'tstsx/suspensify';

const fetchUser = suspensify(() => fetch('/api/user').then(r => r.json()));

function UserProfile() {
  const user = fetchUser();
  return <div>{user.name}</div>;
}
```

[전체 문서](../react/suspensify/README.ko.md)

#### Stack Navigation

모달, 위저드 등을 위한 타입 안전 스택 기반 네비게이션입니다.

```tsx
import { createStackNavigation } from 'tstsx/stack-navigation';

const [StackNavigation, useStackNavigation] = createStackNavigation(
  'AppStack',
  { entries: ['home', 'profile', 'settings'] }
);
```

[전체 문서](../react/stack-navigation/README.ko.md)

### Vanilla 유틸리티

#### Collections

효율적인 객체 비교를 위한 해시 함수를 지원하는 커스텀 자료구조입니다.

```tsx
import { HashMap, HashSet } from 'tstsx/collections';

const userMap = new HashMap<User, string>({
  getHash: (user) => user.id,
});

const points = new HashSet<Point>({
  getHash: (point) => `${point.x},${point.y}`,
});
```

[전체 문서](../vanilla/collections/README.ko.md)

#### Object Diff

고급 설정을 지원하는 깊은 객체 비교입니다.

```tsx
import { objectDiff } from 'tstsx/object-diff';

const diffs = objectDiff(before, after, {
  ignorePaths: ['metadata.timestamp'],
  ignoreTypes: ['function']
});
```

[전체 문서](../vanilla/object-diff/README.ko.md)

#### Poll

조건이 충족되거나 타임아웃이 발생할 때까지 비동기 함수를 반복적으로 실행합니다.

```tsx
import { poll } from 'tstsx/poll';

const result = await poll(
  async () => {
    const response = await fetch('/api/status');
    return response.json();
  },
  {
    shouldContinue: (data) => data.status !== 'complete',
    interval: 1000,
    timeout: 30000,
  }
);
```

[전체 문서](../vanilla/poll/README.ko.md)

#### Preventable

React 이벤트에 대한 내장 방지 메커니즘을 가진 이벤트 핸들러를 생성합니다.

```tsx
import { preventable } from 'tstsx/preventable';

const handleSubmit = preventable(
  async (event) => {
    if (!isValid) {
      event.prevent();
      return;
    }
    await submitForm(event.data);
  }
);

<form onSubmit={handleSubmit}>...</form>
```

[전체 문서](../vanilla/preventable/README.ko.md)

## 트리 쉐이킹

이 패키지는 최적의 트리 쉐이킹을 위해 설계되었습니다. 특정 서브 경로에서 import하면:

```tsx
import { createStackNavigation } from 'tstsx/stack-navigation';
```

번들러는 전체 라이브러리가 아닌 `stack-navigation` 모듈만 포함합니다. 이를 통해 번들 크기를 최소화할 수 있습니다.

## 라이선스

MIT
