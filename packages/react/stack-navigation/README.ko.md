[English](./README.md) | 한국어

# @tstsx/stack-navigation

React 애플리케이션을 위한 타입 안전 스택 기반 네비게이션.

## 왜 사용하나요?

React에서 UI 스택(모달, 드로어, 위저드 등)을 관리하는 것은 복잡하고 오류가 발생하기 쉽습니다. 이 라이브러리는 다음을 제공합니다:

- **타입 안전 네비게이션**: 스택 항목을 정의하고 완전한 TypeScript 자동완성을 받으세요
- **선언적 API**: 스택 항목을 컴포넌트로 정의하고, 훅으로 네비게이션을 트리거하세요
- **스택 연산**: Push, pop, clear, pop-to-top 연산
- **유연한 렌더링**: 정적 또는 동적 항목 렌더링 사용
- **상태 관리**: 외부 상태와 동기화하기 위한 선택적 콜백

다단계 폼, 모달 스택, 위저드 플로우, 드로어 네비게이션 및 스택 패러다임을 따르는 모든 UI 패턴에 완벽합니다.

## 설치

```bash
npm install @tstsx/stack-navigation
```

## 사용법

### 기본 예제

```tsx
import { createStackNavigation } from '@tstsx/stack-navigation';

const [StackNavigation, useStackNavigation] = createStackNavigation(
  'AppStack',
  { entries: ['home', 'profile', 'settings'] }
);

function App() {
  return (
    <StackNavigation initialStack={['home']}>
      <StackNavigation.Entry value="home">
        <HomePage />
      </StackNavigation.Entry>

      <StackNavigation.Entry value="profile">
        <ProfilePage />
      </StackNavigation.Entry>

      <StackNavigation.Entry value="settings">
        <SettingsPage />
      </StackNavigation.Entry>

      <StackNavigation.Trigger>
        {({ push, pop }) => (
          <div>
            <button onClick={() => push('profile')}>프로필로 이동</button>
            <button onClick={() => pop()}>뒤로 가기</button>
          </div>
        )}
      </StackNavigation.Trigger>
    </StackNavigation>
  );
}
```

### 동적 항목 렌더링

```tsx
function App() {
  return (
    <StackNavigation initialStack={['home']}>
      <StackNavigation.DynamicEntry>
        {(currentEntry) => {
          switch (currentEntry) {
            case 'home':
              return <HomePage />;
            case 'profile':
              return <ProfilePage />;
            case 'settings':
              return <SettingsPage />;
          }
        }}
      </StackNavigation.DynamicEntry>
    </StackNavigation>
  );
}
```

### 훅 사용하기

```tsx
function NavigationButton() {
  const { push, pop, stack, popToTop, clear } = useStackNavigation();

  return (
    <div>
      <p>현재 스택: {stack.join(' > ')}</p>
      <button onClick={() => push('settings')}>설정</button>
      <button onClick={() => pop()}>뒤로</button>
      <button onClick={() => popToTop()}>맨 위로</button>
      <button onClick={() => clear()}>모두 지우기</button>
    </div>
  );
}
```

### 외부 상태와 동기화

```tsx
function App() {
  const [stack, setStack] = useState(['home']);

  return (
    <StackNavigation 
      initialStack={stack}
      onChangeStack={setStack}
    >
      {/* ... */}
    </StackNavigation>
  );
}
```

### 타입 제약 없이 사용

```tsx
const [StackNavigation, useStackNavigation] = createStackNavigation('AppStack');

// 이제 모든 문자열을 받습니다
<StackNavigation.Entry value="any-string">
  <Component />
</StackNavigation.Entry>
```

## API

### `createStackNavigation<T>(displayName, options?)`

새 스택 네비게이션 인스턴스를 생성합니다.

**매개변수:**
- `displayName`: 네비게이션의 문자열 이름 (에러 메시지 및 DevTools에서 사용)
- `options`: (선택사항) 설정 객체
  - `entries`: 타입 안전성을 위한 허용된 항목 값의 읽기 전용 튜플

**반환값:**
- `[StackNavigation, useStackNavigation]`: 컴포넌트와 훅을 포함하는 튜플

### `StackNavigation`

스택 상태를 관리하는 루트 컴포넌트.

**Props:**
- `children`: React 자식 요소 (Entry, DynamicEntry, Trigger 컴포넌트)
- `initialStack`: (선택사항) 초기 스택 상태 (`entries`가 제공된 경우 첫 번째 항목이 기본값)
- `onChangeStack`: (선택사항) 스택이 변경될 때마다 호출되는 콜백

### `StackNavigation.Entry`

이 항목이 스택의 맨 위에 있을 때만 자식 요소를 렌더링합니다.

**Props:**
- `value`: 항목 식별자 (`entries`가 제공된 경우 타입 안전)
- `children`: 활성 상태일 때 렌더링할 콘텐츠
- `asChild`: (선택사항) true인 경우, 래퍼 div 없이 자식 요소를 직접 렌더링

### `StackNavigation.DynamicEntry`

렌더 함수로 현재 최상위 항목에 기반하여 렌더링합니다.

**Props:**
- `children`: 현재 항목 값을 받는 렌더 함수

### `StackNavigation.Trigger`

렌더 props를 통해 네비게이션 함수를 제공합니다.

**Props:**
- `children`: `{ push, pop, clear }`를 받는 렌더 함수

### `useStackNavigation()`

네비게이션 상태와 함수에 접근하기 위한 훅.

**반환값:**
- `stack`: 현재 스택 배열
- `push(entry)`: 스택 맨 위에 항목 추가
- `pop(count?)`: 맨 위에서 항목 제거 (기본값: 1)
- `clear()`: 스택에서 모든 항목 제거
- `popToTop()`: 첫 번째 항목을 제외한 모든 항목 제거

## 실제 사용 예제

### 모달 스택

```tsx
const [ModalStack, useModalStack] = createStackNavigation(
  'ModalStack',
  { entries: ['confirm', 'edit', 'delete'] }
);

function App() {
  return (
    <ModalStack>
      <ModalStack.Entry value="confirm">
        <ConfirmModal />
      </ModalStack.Entry>
      <ModalStack.Entry value="edit">
        <EditModal />
      </ModalStack.Entry>
      <ModalStack.Entry value="delete">
        <DeleteModal />
      </ModalStack.Entry>
    </ModalStack>
  );
}
```

### 다단계 폼

```tsx
const [FormStack] = createStackNavigation(
  'FormWizard',
  { entries: ['personal', 'address', 'payment', 'review'] }
);

function Wizard() {
  return (
    <FormStack initialStack={['personal']}>
      <FormStack.Entry value="personal">
        <PersonalInfoStep />
      </FormStack.Entry>
      <FormStack.Entry value="address">
        <AddressStep />
      </FormStack.Entry>
      <FormStack.Entry value="payment">
        <PaymentStep />
      </FormStack.Entry>
      <FormStack.Entry value="review">
        <ReviewStep />
      </FormStack.Entry>
    </FormStack>
  );
}
```

## 라이선스

MIT
