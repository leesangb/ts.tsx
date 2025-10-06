# @tstsx/exception-boundary

[English](./README.md) | 한국어

타입 안전한 선언적 에러 처리를 제공하는 React 예외 경계(Exception Boundary).

## 왜 사용하나요?

전통적인 React 에러 경계는 JavaScript 에러가 throw되는 것에 의존하여 예측하기 어렵고 관리하기 힘듭니다. 이 라이브러리는 다음을 제공합니다:

- **타입 안전한 예외**: 예외 타입을 정의하고 완전한 TypeScript 지원을 받으세요
- **선언적 에러 처리**: 다양한 예외 타입을 각기 다른 UI 컴포넌트로 처리하세요
- **제어된 에러 흐름**: 런타임 에러에 의존하지 않고 프로그래밍 방식으로 예외를 발생시키세요
- **더 나은 개발 경험**: 예외 타입과 핸들러에 대한 자동완성과 타입 체킹을 지원합니다

## 설치

```bash
npm install @tstsx/exception-boundary
```

## 사용법

### 기본 예제

```tsx
import { createExceptionBoundary } from '@tstsx/exception-boundary';

type AppException =
  | { type: 'network-error'; message: string; statusCode: number }
  | { type: 'not-found'; resource: string }
  | { type: 'unauthorized' };

const [ExceptionBoundary, useExceptionBoundary] = createExceptionBoundary<AppException>('AppExceptionBoundary');

function App() {
  return (
    <ExceptionBoundary
      fallback={{
        'network-error': (exception, reset) => (
          <div>
            <h1>네트워크 오류</h1>
            <p>{exception.message} (상태 코드: {exception.statusCode})</p>
            <button onClick={reset}>다시 시도</button>
          </div>
        ),
        'not-found': (exception, reset) => (
          <div>
            <h1>찾을 수 없음</h1>
            <p>리소스 "{exception.resource}"를 찾을 수 없습니다</p>
            <button onClick={reset}>돌아가기</button>
          </div>
        ),
        'unauthorized': (exception, reset) => (
          <div>
            <h1>인증되지 않음</h1>
            <button onClick={reset}>로그인</button>
          </div>
        ),
      }}
    >
      <YourApp />
    </ExceptionBoundary>
  );
}

function YourComponent() {
  const { throwException } = useExceptionBoundary();

  const handleClick = async () => {
    try {
      await fetchData();
    } catch (error) {
      throwException({
        type: 'network-error',
        message: '데이터를 가져오는데 실패했습니다',
        statusCode: 500,
      });
    }
  };

  return <button onClick={handleClick}>데이터 가져오기</button>;
}
```

## API

### `createExceptionBoundary<T>(displayName)`

지정된 예외 타입으로 새로운 예외 경계를 생성합니다.

**매개변수:**
- `displayName`: 경계의 문자열 이름 (에러 메시지 및 React DevTools에서 사용됨)

**반환값:**
- `[ExceptionBoundary, useExceptionBoundary]`: 경계 컴포넌트와 훅을 포함하는 튜플

### `ExceptionBoundary`

예외를 잡는 경계 컴포넌트입니다.

**Props:**
- `children`: 렌더링할 React 자식 요소
- `fallback`: 예외 타입을 렌더 함수에 매핑하는 객체
  - 각 함수는 `(exception, resetException) => ReactNode` 형태입니다
  - `exception`: 완전한 타입 정보를 가진 발생한 예외
  - `resetException`: 예외를 지우고 자식 요소를 다시 렌더링하는 함수

### `useExceptionBoundary()`

예외 경계 기능에 접근하기 위한 훅입니다.

**반환값:**
- `throwException(exception)`: 타입이 지정된 예외를 발생시키는 함수

## 라이선스

MIT
