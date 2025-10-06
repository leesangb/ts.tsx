[English](./README.md) | 한국어

# @tstsx/preventable

유연한 이벤트 기반 API로 함수 실행을 가로채고 조건부로 방지할 수 있습니다.

## 왜 사용하나요?

때로는 핵심 로직을 수정하지 않고 함수에 사전 실행 훅을 추가해야 할 때가 있습니다. 이 라이브러리는 다음을 제공합니다:

- **이벤트 기반 가로채기**: 원본 함수 실행 전에 여러 핸들러 추가
- **조건부 방지**: 동적 조건에 따라 함수 실행 중단
- **매개변수 접근**: 원본 함수에 전달된 매개변수 읽기 및 수정
- **비동기 지원**: 동기 및 비동기 함수 모두와 완벽하게 작동
- **타입 안전**: 함수 시그니처를 유지하는 완전한 TypeScript 지원

다음에 적합합니다: 유효성 검사 훅, 권한 확인, 로깅, 분석, 폼 제출 제어 및 조건부 동작.

## 설치

```bash
npm install @tstsx/preventable
```

## 사용법

### 기본 예제

```typescript
import { preventable } from '@tstsx/preventable';

const submitForm = (data: FormData) => {
  console.log('제출 중:', data);
};

const wrappedSubmit = preventable(submitForm, [
  (event) => {
    if (!event.params[0].has('email')) {
      event.preventDefault();
      console.log('이메일이 필요합니다');
    }
  }
]);

wrappedSubmit(new FormData()); // "이메일이 필요합니다" 출력, 제출 안됨
```

### 여러 핸들러

```typescript
const saveData = (data: any) => {
  console.log('저장 중:', data);
};

const wrappedSave = preventable(saveData, [
  (event) => {
    console.log('핸들러 1: 시도 로깅');
  },
  (event) => {
    if (event.params[0].invalid) {
      event.preventDefault();
      console.log('핸들러 2: 데이터가 유효하지 않음');
    }
  },
  (event) => {
    console.log('핸들러 3: 방지되어도 여전히 실행됨');
  }
]);

wrappedSave({ invalid: true });
// 출력:
// "핸들러 1: 시도 로깅"
// "핸들러 2: 데이터가 유효하지 않음"
// "핸들러 3: 방지되어도 여전히 실행됨"
// saveData는 호출되지 않음
```

### 비동기 함수

```typescript
const saveToDatabase = async (user: User) => {
  await db.users.insert(user);
};

const wrappedSave = preventable(saveToDatabase, [
  async (event) => {
    const user = event.params[0];
    const exists = await db.users.findByEmail(user.email);
    
    if (exists) {
      event.preventDefault();
      throw new Error('사용자가 이미 존재합니다');
    }
  }
]);

await wrappedSave({ email: 'user@example.com', name: 'John' });
```

### 커스텀 매개변수

```typescript
const logMessage = (message: string) => {
  console.log('메시지:', message);
};

const wrappedLog = preventable(logMessage, [
  (event) => {
    // 수정된 매개변수로 원본 함수 호출
    event.default(`[${new Date().toISOString()}] ${event.params[0]}`);
    event.preventDefault(); // 원래 매개변수로 호출 방지
  }
]);

wrappedLog('안녕하세요');
// 출력: "메시지: [2024-01-01T00:00:00.000Z] 안녕하세요"
```

### 방지 상태 확인

```typescript
const processData = (data: any) => {
  console.log('처리 중:', data);
};

const wrappedProcess = preventable(processData, [
  (event) => {
    console.log('핸들러 1');
  },
  (event) => {
    if (event.params[0].shouldPrevent) {
      event.preventDefault();
    }
  },
  (event) => {
    // 이미 방지되었는지 확인
    if (event.defaultPrevented) {
      console.log('이미 방지됨, 유효성 검사 건너뛰기');
      return;
    }
    // 추가 유효성 검사...
  }
]);
```

## API

### `preventable(defaultAction, handlers)`

원본 함수 실행 전에 핸들러를 실행하는 래퍼 함수를 생성합니다.

**매개변수:**
- `defaultAction`: 래핑할 함수 (동기 또는 비동기)
- `handlers`: `defaultAction` 전에 실행할 핸들러 함수 배열

**반환값:**
- `defaultAction`과 동일한 시그니처를 가진 함수

### Event 객체

각 핸들러는 다음 속성을 가진 event 객체를 받습니다:

```typescript
type Event<T> = {
  // preventDefault()가 호출되었는지 여부
  defaultPrevented: boolean;
  
  // 래핑된 함수에 전달된 매개변수
  params: Parameters<T>;
  
  // 원본 함수 호출 (선택적으로 다른 매개변수 사용)
  default: T;
  
  // 원본 함수 실행 방지
  preventDefault: () => void;
};
```

### Handler 함수

```typescript
type EventHandler<T> = (event: Event<T>) => void | Promise<void>;
```

## 실제 사용 예제

### 폼 유효성 검사

```typescript
function LoginForm() {
  const handleSubmit = preventable(
    async (email: string, password: string) => {
      await loginUser(email, password);
    },
    [
      (event) => {
        const [email, password] = event.params;
        
        if (!email || !password) {
          event.preventDefault();
          showError('이메일과 비밀번호가 필요합니다');
        }
      },
      (event) => {
        const [email] = event.params;
        
        if (!email.includes('@')) {
          event.preventDefault();
          showError('잘못된 이메일 형식');
        }
      }
    ]
  );
  
  return <form onSubmit={() => handleSubmit(email, password)}>...</form>;
}
```

### 권한 확인

```typescript
const deleteUser = preventable(
  async (userId: string) => {
    await api.users.delete(userId);
  },
  [
    async (event) => {
      const currentUser = await getCurrentUser();
      
      if (!currentUser.isAdmin) {
        event.preventDefault();
        throw new Error('권한 없음: 관리자 권한이 필요합니다');
      }
    }
  ]
);
```

### 분석 및 로깅

```typescript
const trackEvent = (eventName: string, data: any) => {
  analytics.track(eventName, data);
};

const wrappedTrack = preventable(trackEvent, [
  (event) => {
    // 개발 환경에서 콘솔에 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('분석:', event.params);
    }
  },
  (event) => {
    // 테스트 환경에서는 추적하지 않음
    if (process.env.NODE_ENV === 'test') {
      event.preventDefault();
    }
  }
]);
```

### 속도 제한

```typescript
const apiCall = preventable(
  async (endpoint: string) => {
    return await fetch(endpoint);
  },
  [
    async (event) => {
      const [endpoint] = event.params;
      const canProceed = await rateLimiter.check(endpoint);
      
      if (!canProceed) {
        event.preventDefault();
        throw new Error('속도 제한 초과');
      }
    }
  ]
);
```

## 라이선스

MIT
