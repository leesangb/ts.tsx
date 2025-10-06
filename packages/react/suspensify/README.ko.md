[English](./README.md) | 한국어

# @tstsx/suspensify

프로미스를 React Suspense와 호환되는 리소스로 변환합니다.

## 설치

```bash
npm install @tstsx/suspensify
```

또는 통합 패키지로:

```bash
npm install @tstsx
```

## 사용법

### 기본 예제

```tsx
import { Suspense } from 'react';
import { suspensify } from '@tstsx/suspensify';

const fetchUser = suspensify(() => fetch('/api/user').then(r => r.json()));

function UserProfile() {
  const user = fetchUser();
  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <UserProfile />
    </Suspense>
  );
}
```

### 작동 방식

`suspensify`는 프로미스 팩토리 함수를 래핑하고 다음을 수행하는 함수를 반환합니다:
- 아직 대기 중일 때 프로미스를 throw합니다 (React Suspense가 이를 캐치)
- 성공 시 resolve된 값을 반환합니다
- 프로미스가 rejected되면 에러를 throw합니다

이를 통해 React Suspense와 완벽하게 통합되는 동기적으로 보이는 코드를 작성할 수 있습니다.

## API

### `suspensify<T>(promiseFactory: () => Promise<T>): () => T`

프로미스 팩토리를 Suspense와 호환되는 리소스로 변환합니다.

**매개변수:**
- `promiseFactory` - Suspense 리소스로 변환할 프로미스를 반환하는 함수

**반환값:**
- 호출 시 resolve된 값을 반환하는 함수

**Throw:**
- 아직 대기 중이면 원본 프로미스 (React Suspense가 캐치)
- 프로미스가 rejected되면 에러

## 데이터 페칭 예제

```tsx
import { Suspense } from 'react';
import { suspensify } from '@tstsx/suspensify';

async function fetchPosts() {
  const response = await fetch('/api/posts');
  return response.json();
}

const getPosts = suspensify(() => fetchPosts());

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
    <Suspense fallback={<div>게시물 로딩 중...</div>}>
      <PostList />
    </Suspense>
  );
}
```

## @tstsx/init와 함께 사용

`suspensify` 유틸리티는 [@tstsx/init](../init)에서 비동기 컴포넌트 초기화를 위해 내부적으로 사용됩니다. 더 높은 수준의 비동기 초기화 패턴이 필요하면 `withInitializer` HOC를 확인하세요.

## 라이선스

MIT
