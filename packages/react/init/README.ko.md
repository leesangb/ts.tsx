# @tstsx/init

[English](./README.md) | 한국어

Suspense 통합을 지원하는 비동기 초기화를 위한 React HOC.

## 왜 사용하나요?

React 애플리케이션을 구축할 때 컴포넌트를 렌더링하기 전에 데이터를 로드해야 하는 경우가 많습니다. 이 라이브러리는 다음을 제공합니다:

- **Suspense 지원**: 원활한 로딩 상태를 위해 React Suspense 기반으로 구축
- **타입 안전**: 적절한 타입 추론과 함께 완전한 TypeScript 지원
- **간단한 API**: 컴포넌트를 감싸고 초기화 함수를 제공하기만 하면 됩니다
- **데이터 병합**: 초기화된 데이터를 컴포넌트 props와 자동으로 병합

## 설치

```bash
npm install @tstsx/init
```

## 사용법

### `withInitializer`를 사용한 기본 예제

```tsx
import { withInitializer } from '@tstsx/init';
import { Suspense } from 'react';

type UserData = {
  name: string;
  age: number;
};

type Props = {
  userId: string;
};

const UserProfile = ({ userId, name, age }: Props & Partial<UserData>) => (
  <div>
    <h1>사용자: {userId}</h1>
    {name && <p>이름: {name}</p>}
    {age && <p>나이: {age}</p>}
  </div>
);

const fetchUserData = async (): Promise<UserData> => {
  const response = await fetch('/api/user');
  return response.json();
};

const UserProfileWithData = withInitializer<Props, UserData>(
  UserProfile,
  fetchUserData
);

function App() {
  return (
    <Suspense fallback={<div>사용자 로딩 중...</div>}>
      <UserProfileWithData userId="123" />
    </Suspense>
  );
}
```

### `withInitializerSuspense` 사용하기 (Suspense 포함)

```tsx
import { withInitializerSuspense } from '@tstsx/init';

const UserProfileWithSuspense = withInitializerSuspense<Props, UserData>(
  UserProfile,
  fetchUserData,
  <div>사용자 로딩 중...</div> // 커스텀 fallback
);

function App() {
  // Suspense로 감쌀 필요 없음 - 이미 포함되어 있습니다!
  return <UserProfileWithSuspense userId="123" />;
}
```

### `suspensify` 직접 사용하기

```tsx
import { suspensify } from '@tstsx/init';
import { Suspense } from 'react';

const getData = suspensify(() => fetch('/api/data').then(r => r.json()));

function Component() {
  const data = getData(); // 첫 렌더링에서 Suspense로 promise를 throw
  return <div>{data.value}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <Component />
    </Suspense>
  );
}
```

## API

### `withInitializer<P, R>(Component, initializer)`

렌더링 전에 데이터를 로드하는 고차 컴포넌트를 생성합니다. Suspense로 감싸야 합니다.

**매개변수:**
- `Component`: props `P`와 초기화된 데이터 `R`을 받는 React 컴포넌트
- `initializer`: `R` 타입의 데이터를 반환하는 비동기 함수

**반환값:**
- `P` 타입의 props를 받아 감싸진 컴포넌트에 `R`을 자동으로 제공하는 컴포넌트

**참고:** 감싸진 컴포넌트는 반드시 `<Suspense>` 경계 내부에서 사용되어야 합니다.

### `withInitializerSuspense<P, R>(Component, initializer, fallback?)`

`withInitializer`와 동일하지만 Suspense 래퍼를 포함합니다.

**매개변수:**
- `Component`: props `P`와 초기화된 데이터 `R`을 받는 React 컴포넌트
- `initializer`: `R` 타입의 데이터를 반환하는 비동기 함수
- `fallback`: (선택사항) 로딩 중 표시할 React 노드. 기본값은 `<></>`

**반환값:**
- 내장 Suspense 처리와 함께 `P` 타입의 props를 받는 컴포넌트

### `suspensify<T>(promiseFactory)`

Promise 팩토리 함수를 Suspense 호환 함수로 변환합니다.

**매개변수:**
- `promiseFactory`: suspensify할 Promise를 반환하는 함수

**반환값:**
- 해결된 값을 반환하거나 Suspense로 promise/error를 throw하는 함수

**사용법:**
- Suspense로 감싸진 컴포넌트 내부에서 반환된 함수를 호출하세요
- 첫 렌더링 시(pending), Suspense를 트리거하기 위해 promise를 throw합니다
- 성공 시, 해결된 값을 반환합니다
- 에러 시, Error Boundary에 잡히도록 에러를 throw합니다

## 작동 원리

이 라이브러리는 React Suspense의 throw 메커니즘을 사용합니다:

1. **대기 중**: 컴포넌트가 promise를 throw하여 Suspense fallback을 트리거합니다
2. **성공**: 컴포넌트가 해결된 데이터를 받아 정상적으로 렌더링합니다  
3. **에러**: 컴포넌트가 Error Boundary에 잡히도록 에러를 throw합니다

이는 로딩 상태를 수동으로 관리하지 않고도 비동기 작업을 처리하는 깔끔하고 선언적인 방법을 제공합니다.

## 라이선스

MIT
