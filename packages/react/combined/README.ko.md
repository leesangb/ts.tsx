[English](./README.md) | 한국어

# @tstsx/combined

깔끔하고 타입 안전한 API로 여러 React 컴포넌트를 조합합니다.

## 왜 사용하나요?

깊게 중첩된 컴포넌트 계층(프로바이더, HOC, 래퍼)은 읽기 어려운 코드를 만듭니다. 이 라이브러리는 다음을 제공합니다:

- **플랫한 컴포넌트 조합**: 중첩된 JSX를 단순한 배열로 대체
- **타입 안전 props**: 각 컴포넌트의 props에 대한 자동완성이 포함된 완전한 TypeScript 지원
- **더 깔끔한 코드**: 우측 드리프트를 제거하고 가독성 향상
- **제로 런타임 오버헤드**: 조합을 위해 `reduceRight`를 사용하는 단순한 래퍼

프로바이더 조합, HOC 체이닝, Radix UI 컴포넌트 래퍼 및 깊게 중첩된 컴포넌트를 만드는 모든 패턴에 완벽합니다.

## 설치

```bash
npm install @tstsx/combined
```

## 사용법

### 프로바이더 조합

**변경 전:**
```tsx
<Provider1 value="test">
  <Provider2 count={42}>
    <Provider3 enabled>
      <ChildComponent />
    </Provider3>
  </Provider2>
</Provider1>
```

**변경 후:**
```tsx
<Combined
  components={[
    [Provider1, { value: 'test' }],
    [Provider2, { count: 42 }],
    [Provider3, { enabled: true }],
  ]}>
  <ChildComponent />
</Combined>
```

### Radix UI 컴포넌트

**변경 전:**
```tsx
<Tooltip.Trigger asChild>
  <Dialog.Trigger asChild>
    <Menu.Trigger asChild>
      <MyButton />
    </Menu.Trigger>
  </Dialog.Trigger>
</Tooltip.Trigger>
```

**변경 후:**
```tsx
<Combined
  components={[
    [Tooltip.Trigger, { asChild: true }],
    [Dialog.Trigger, { asChild: true }],
    [Menu.Trigger, { asChild: true }],
  ]}>
  <MyButton />
</Combined>
```

### 선택적 Props

선택적 props만 있는 컴포넌트는 튜플의 두 번째 요소가 필요하지 않습니다:

```tsx
<Combined
  components={[
    [OptionalPropsProvider],
    [AnotherProvider, { config: true }],
  ]}>
  <Content />
</Combined>
```

## API

### `Combined`

여러 컴포넌트를 조합하기 위한 메인 컴포넌트.

**Props:**
- `components`: 각 튜플이 `[Component, props?]`인 튜플 배열
  - 첫 번째 요소: React 컴포넌트
  - 두 번째 요소 (선택사항): 컴포넌트의 props 객체
- `children`: 조합된 컴포넌트 내부에 렌더링할 React 자식 요소

**타입 안전성:**
- 각 컴포넌트의 props가 완전히 타입 지정됨
- TypeScript가 각 컴포넌트의 props를 자동완성하고 검증
- 선택적 props 컴포넌트는 props 객체 생략 가능

## 실제 사용 예제

### Context 프로바이더

```tsx
function App() {
  return (
    <Combined
      components={[
        [ThemeProvider, { theme: 'dark' }],
        [AuthProvider, { apiUrl: '/api' }],
        [I18nProvider, { locale: 'en' }],
      ]}>
      <Routes />
    </Combined>
  );
}
```

### 고차 컴포넌트

```tsx
<Combined
  components={[
    [withAuth],
    [withLogging, { level: 'debug' }],
    [withErrorBoundary, { fallback: <Error /> }],
  ]}>
  <Dashboard />
</Combined>
```

### 폼 필드 래퍼

```tsx
<Combined
  components={[
    [Form.Field, { name: 'email' }],
    [Form.Control],
    [Form.Label, { htmlFor: 'email' }],
  ]}>
  <Input type="email" />
</Combined>
```

## 작동 방식

`Combined`는 `Array.reduceRight`를 사용하여 컴포넌트를 바깥쪽에서 안쪽으로 감쌉니다. 각 컴포넌트는 다음 중첩된 컴포넌트를 `children` prop으로 받아, 수동 중첩과 동일한 구조를 만들지만 더 깔끔한 구문을 제공합니다.

## 라이선스

MIT
