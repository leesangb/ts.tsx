# ts.tsx

한국어 | [English](./README.md)

TypeScript + React 유틸리티 라이브러리 모노레포

## 패키지 구조

이 프로젝트는 pnpm workspace를 사용하는 모노레포입니다. 다음과 같은 패키지들을 포함하고 있습니다:

### React 패키지

- **[@tstsx/combined](./packages/react/combined)** - 깔끔하고 타입 안전한 API로 여러 React 컴포넌트 조합
- **[@tstsx/exception-boundary](./packages/react/exception-boundary)** - 타입 안전한 예외 처리를 위한 React Error Boundary
- **[@tstsx/init](./packages/react/init)** - 비동기 초기화 및 Suspense 통합을 위한 HOC
- **[@tstsx/stack-navigation](./packages/react/stack-navigation)** - 스택 기반 내비게이션 컴포넌트
- **[@tstsx/suspensify](./packages/react/suspensify)** - Promise를 Suspense 호환 리소스로 변환

### Vanilla 패키지

- **[@tstsx/object-diff](./packages/vanilla/object-diff)** - 객체 비교 유틸리티

### 통합 패키지

- **[@tstsx](./packages/tstsx)** - 모든 패키지를 하나로 통합한 단일 패키지

## 설치

### 개별 패키지 설치

필요한 패키지만 개별적으로 설치할 수 있습니다:

```bash
npm install @tstsx/combined
npm install @tstsx/exception-boundary
npm install @tstsx/init
npm install @tstsx/stack-navigation
npm install @tstsx/suspensify
npm install @tstsx/object-diff
```

### 전체 패키지 설치

모든 기능을 한 번에 사용하려면 통합 패키지를 설치하세요:

```bash
npm install @tstsx
```

통합 패키지 사용 예시:

```tsx
import { Combined } from '@tstsx/combined';
import { createExceptionBoundary } from '@tstsx/exception-boundary';
import { withInitializer } from '@tstsx/init';
import { createStackNavigation } from '@tstsx/stack-navigation';
import { suspensify } from '@tstsx/suspensify';
import { objectDiff } from '@tstsx/object-diff';
```

## 개발 환경 설정

### 필수 요구사항

- **Node.js**: 24.9.0 (Volta로 관리)
- **pnpm**: 10.x (packageManager 필드로 관리)

### Volta 설치 (권장)

Volta를 사용하면 Node.js 버전이 자동으로 관리됩니다:

```bash
curl https://get.volta.sh | bash
```

프로젝트 디렉토리로 이동하면 자동으로 Node.js 24.9.0이 활성화됩니다.

### 의존성 설치

```bash
pnpm install
```

## 개발 스크립트

### 빌드

```bash
pnpm build
```

모든 패키지를 빌드합니다. Turbo를 사용하여 병렬로 빌드하며 의존성 순서를 자동으로 처리합니다.

### 개발 모드

```bash
pnpm dev
```

모든 패키지를 watch 모드로 실행합니다.

### 테스트

```bash
pnpm test
```

모든 패키지의 테스트를 실행합니다 (Vitest 사용).

### 린트 및 포맷팅

```bash
# Biome으로 포맷팅
pnpm format

# Biome으로 체크
pnpm check

# 린트 실행
pnpm lint
```

### 클린

```bash
pnpm clean
```

모든 빌드 아티팩트를 제거합니다.

## 패키지 간 연결

이 모노레포는 pnpm workspace를 사용하여 패키지 간 의존성을 관리합니다:

1. **Workspace 프로토콜**: 패키지 간 참조는 `workspace:*`를 사용합니다
2. **자동 링킹**: pnpm이 자동으로 로컬 패키지를 심볼릭 링크로 연결합니다
3. **통합 패키지**: `@tstsx` 패키지는 모든 개별 패키지를 의존성으로 가지며, 각 기능을 re-export합니다

예시 (`packages/tstsx/package.json`):

```json
{
  "dependencies": {
    "@tstsx/exception-boundary": "workspace:*",
    "@tstsx/init": "workspace:*",
    "@tstsx/object-diff": "workspace:*",
    "@tstsx/stack-navigation": "workspace:*"
  }
}
```

## 버전 관리 및 배포

### Changesets 워크플로우

이 프로젝트는 [Changesets](https://github.com/changesets/changesets)를 사용하여 버전 관리와 배포를 자동화합니다.

#### 1. 변경사항 기록

기능 추가, 버그 수정 등의 변경 후 changeset을 생성합니다:

```bash
pnpm changeset
```

대화형 프롬프트가 나타나면:
1. 변경된 패키지 선택
2. 버전 타입 선택 (major/minor/patch)
3. 변경 내용 요약 작성

이 명령은 `.changeset` 디렉토리에 마크다운 파일을 생성합니다.

#### 2. 버전 업데이트

로컬에서 버전을 업데이트하려면:

```bash
pnpm version-packages
```

이 명령은:
- 각 패키지의 `package.json` 버전 업데이트
- CHANGELOG.md 자동 생성/업데이트
- changeset 파일 제거

#### 3. 배포

**로컬 배포:**

```bash
pnpm release
```

이 명령은 빌드 후 npm에 배포합니다.

**자동 배포 (GitHub Actions):**

1. `main` 브랜치에 푸시하면 GitHub Actions 워크플로우가 실행됩니다
2. Changesets가 있으면:
   - "Version Packages" PR을 자동 생성
   - PR을 머지하면 npm에 자동 배포
3. 배포는 `NPM_TOKEN` 시크릿을 사용합니다

### 배포 프로세스 상세

```
┌─────────────────┐
│ 변경 사항 커밋   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ pnpm changeset  │ ← 변경사항 기록
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ main에 푸시      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ GitHub Actions 실행     │
│ - 빌드                  │
│ - Version PR 생성       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Version PR 머지         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ npm에 자동 배포         │
└─────────────────────────┘
```

## 새 패키지 생성

새 패키지를 생성하려면:

```bash
pnpm create-package
```

대화형 프롬프트가 패키지 설정을 안내합니다.

## 기술 스택

- **빌드 도구**: Vite
- **테스트**: Vitest
- **린터/포매터**: Biome
- **타입체커**: TypeScript 5.9
- **모노레포 도구**: Turbo + pnpm workspace
- **버전 관리**: Changesets
- **CI/CD**: GitHub Actions

## Catalog 사용

pnpm catalog를 사용하여 공통 의존성 버전을 관리합니다:

- `catalog:react18` - React 18 의존성
- `catalog:react19` - React 19 의존성
- `catalog:core` - TypeScript 등 핵심 도구
- `catalog:test` - Vitest, Testing Library 등
- `catalog:tools` - Biome, Vite 등

## 라이선스

MIT
