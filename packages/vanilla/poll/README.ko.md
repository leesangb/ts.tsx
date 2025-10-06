[English](./README.md) | 한국어

# @tstsx/poll

재시도 로직, 커스텀 간격, 중단 지원을 갖춘 강력한 폴링 유틸리티입니다.

## 왜 사용하나요?

비동기 작업을 폴링하는 것은 웹 개발에서 흔한 패턴이지만, 재시도, 간격, 에러 처리를 올바르게 구현하는 것은 까다로울 수 있습니다. 이 라이브러리는 다음을 제공합니다:

- **자동 재시도**: 실패한 프로미스에 대한 최대 재시도 횟수 설정
- **유연한 간격**: 고정 지연 또는 시도 번호에 따른 동적 간격 사용
- **조건부 계속**: 커스텀 로직에 따라 성공적인 결과에서도 폴링 계속
- **중단 지원**: AbortSignal로 폴링 작업 취소
- **결과 히스토리**: 모든 폴링 시도의 완전한 히스토리에 접근
- **타입 안전**: 상세한 타입 정보를 가진 완전한 TypeScript 지원

다음에 적합합니다: API 폴링, 작업 상태 확인, 상태 모니터링, 점진적 데이터 로딩 및 비동기 워크플로우.

## 설치

```bash
npm install @tstsx/poll
```

## 사용법

### 기본 예제

```typescript
import { poll } from '@tstsx/poll';

// 성공을 반환할 때까지 API 엔드포인트 폴링
const result = await poll(
  async () => {
    const response = await fetch('/api/task/status');
    return response.json();
  },
  {
    interval: 1000,    // 시도 간 1초 대기
    retryCount: 5      // 실패 시 최대 5회 재시도
  }
);

console.log(result.result); // 최종 성공 결과
console.log(result.history); // 모든 시도의 히스토리
```

### 조건부 폴링

```typescript
// 작업이 완료될 때까지 폴링 계속
const { result } = await poll(
  async () => {
    const response = await fetch('/api/task/123');
    return response.json();
  },
  {
    interval: 2000,
    retryCount: 10,
    shouldContinue: (data) => data.status !== 'completed'
  }
);

console.log('작업 완료:', result);
```

### 동적 간격

```typescript
// 지수 백오프: 1초, 2초, 4초, 8초, ...
const { result } = await poll(
  fetchData,
  {
    interval: (attemptNumber) => Math.pow(2, attemptNumber) * 1000,
    retryCount: 5
  }
);
```

### 중단 지원

```typescript
const controller = new AbortController();

// 30초 후 취소
setTimeout(() => controller.abort(), 30000);

try {
  const { result } = await poll(
    fetchData,
    {
      signal: controller.signal,
      interval: 1000,
      retryCount: 100
    }
  );
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('폴링이 취소되었습니다');
  }
}
```

### 에러 처리

```typescript
import { PollError } from '@tstsx/poll';

try {
  const { result } = await poll(
    fetchData,
    {
      interval: 1000,
      retryCount: 3
    }
  );
} catch (error) {
  if (error instanceof PollError) {
    console.log('모든 재시도 후 폴링 실패');
    console.log('시도 히스토리:', error.results);
    // error.results에는 모든 시도가 포함됩니다:
    // [[error1, null], [error2, null], [null, success], ...]
  }
}
```

## API

### `poll(promise, options?)`

재시도 로직과 간격 지연으로 프로미스를 반복적으로 실행합니다.

**매개변수:**
- `promise`: 실행할 Promise를 반환하는 함수
- `options`: (선택) 설정 객체

**반환값:**
- `Promise<{ result: T, history: ResultHistory<T> }>`

**예외:**
- `PollError`: 최대 재시도 횟수에 도달했을 때
- `AbortError`: AbortSignal을 통해 폴링이 취소되었을 때

### Options

```typescript
type Options<T> = {
  // 다음 시도 전 대기할 간격 (밀리초)
  interval?: number | ((attemptNumber: number) => number);
  
  // 실패 시 최대 재시도 횟수 (기본값: 5)
  retryCount?: number;
  
  // 폴링을 계속할지 결정하는 함수 (기본값: 성공 시 항상 중지)
  shouldContinue?: (result: T) => boolean;
  
  // 폴링을 중단할 신호
  signal?: AbortSignal;
};
```

### Result 타입

```typescript
type SuccessResult<T> = [null, T];
type FailResult = [unknown, null];
type ResultHistory<T> = ReadonlyArray<SuccessResult<T> | FailResult>;

type Result<T> = {
  result: T;              // 최종 성공 결과
  history: ResultHistory<T>; // 모든 시도 결과
};
```

### PollError

```typescript
class PollError<T> extends Error {
  readonly results: ResultHistory<T>; // 모든 시도 결과
}
```

## 실제 사용 예제

### API 작업 상태 폴링

```typescript
async function waitForTaskCompletion(taskId: string) {
  try {
    const { result } = await poll(
      async () => {
        const response = await fetch(`/api/tasks/${taskId}`);
        return response.json();
      },
      {
        interval: 2000,
        retryCount: 30,
        shouldContinue: (task) => task.status === 'pending' || task.status === 'running'
      }
    );
    
    return result;
  } catch (error) {
    if (error instanceof PollError) {
      console.error('작업이 제시간에 완료되지 않았습니다');
    }
    throw error;
  }
}
```

### 지수 백오프를 사용한 상태 확인

```typescript
async function waitForServiceHealth(serviceUrl: string) {
  const { result } = await poll(
    async () => {
      const response = await fetch(`${serviceUrl}/health`);
      if (!response.ok) throw new Error('서비스가 정상이 아닙니다');
      return response.json();
    },
    {
      interval: (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000), // 최대 30초
      retryCount: 10
    }
  );
  
  return result;
}
```

### 재시도를 사용한 폼 제출

```typescript
async function submitFormWithRetry(formData: FormData, abortSignal?: AbortSignal) {
  try {
    const { result, history } = await poll(
      async () => {
        const response = await fetch('/api/submit', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        return response.json();
      },
      {
        interval: 3000,
        retryCount: 3,
        signal: abortSignal
      }
    );
    
    console.log(`${history.length}회 시도 후 제출 성공`);
    return result;
  } catch (error) {
    if (error instanceof PollError) {
      // 모든 재시도 실패 후 사용자 친화적인 에러 표시
      showError('제출에 실패했습니다. 나중에 다시 시도해주세요.');
    }
    throw error;
  }
}
```

### WebSocket 연결 재시도

```typescript
async function connectWithRetry(url: string) {
  const { result } = await poll(
    () => new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      
      ws.onopen = () => resolve(ws);
      ws.onerror = (error) => reject(error);
      
      // 5초 후 타임아웃
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          reject(new Error('연결 타임아웃'));
        }
      }, 5000);
    }),
    {
      interval: (attempt) => 1000 * (attempt + 1), // 선형 백오프
      retryCount: 5
    }
  );
  
  return result;
}
```

### 점진적 데이터 로딩

```typescript
async function loadAllPages(baseUrl: string) {
  const allData: any[] = [];
  let page = 1;
  
  await poll(
    async () => {
      const response = await fetch(`${baseUrl}?page=${page}`);
      const data = await response.json();
      
      allData.push(...data.items);
      page++;
      
      return data;
    },
    {
      interval: 500,
      retryCount: 3,
      shouldContinue: (data) => data.hasMore
    }
  );
  
  return allData;
}
```

## 라이선스

MIT
