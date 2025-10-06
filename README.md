# ts.tsx

[한국어](./README.ko.md) | English

TypeScript + React utility library monorepo

## Package Structure

This is a monorepo using pnpm workspaces. It includes the following packages:

### React Packages

- **[@tstsx/combined](./packages/react/combined)** - Compose multiple React components with a clean, type-safe API
- **[@tstsx/exception-boundary](./packages/react/exception-boundary)** - Type-safe React Error Boundary for declarative exception handling
- **[@tstsx/init](./packages/react/init)** - HOC for async initialization with Suspense integration
- **[@tstsx/stack-navigation](./packages/react/stack-navigation)** - Stack-based navigation component
- **[@tstsx/suspensify](./packages/react/suspensify)** - Convert promises into Suspense-compatible resources

### Vanilla Packages

- **[@tstsx/collections](./packages/vanilla/collections)** - Custom data structures with hash function support (HashMap, HashSet)
- **[@tstsx/object-diff](./packages/vanilla/object-diff)** - Object comparison utility
- **[@tstsx/poll](./packages/vanilla/poll)** - Repeatedly execute async functions until a condition is met
- **[@tstsx/preventable](./packages/vanilla/preventable)** - Event handlers with built-in prevention mechanisms

### Unified Package

- **[@tstsx](./packages/tstsx)** - All-in-one package that bundles all individual packages

## Installation

### Install Individual Packages

You can install only the packages you need:

```bash
npm install @tstsx/combined
npm install @tstsx/exception-boundary
npm install @tstsx/init
npm install @tstsx/stack-navigation
npm install @tstsx/suspensify
npm install @tstsx/collections
npm install @tstsx/object-diff
npm install @tstsx/poll
npm install @tstsx/preventable
```

### Install Unified Package

To use all features at once, install the unified package:

```bash
npm install tstsx
```

Example usage with the unified package:

```tsx
import { Combined } from '@tstsx/combined';
import { createExceptionBoundary } from '@tstsx/exception-boundary';
import { withInitializer } from '@tstsx/init';
import { createStackNavigation } from '@tstsx/stack-navigation';
import { suspensify } from '@tstsx/suspensify';
import { objectDiff } from '@tstsx/object-diff';
```

## Development Setup

### Prerequisites

- **Node.js**: 24.9.0 (managed by Volta)
- **pnpm**: 10.x (managed by packageManager field)

### Install Volta (Recommended)

Volta automatically manages the Node.js version:

```bash
curl https://get.volta.sh | bash
```

When you enter the project directory, Node.js 24.9.0 will be automatically activated.

### Install Dependencies

```bash
pnpm install
```

## Development Scripts

### Build

```bash
pnpm build
```

Builds all packages. Uses Turbo for parallel builds and automatically handles dependency order.

### Development Mode

```bash
pnpm dev
```

Runs all packages in watch mode.

### Test

```bash
pnpm test
```

Runs tests for all packages (uses Vitest).

### Lint and Format

```bash
# Format with Biome
pnpm format

# Check with Biome
pnpm check

# Run lint
pnpm lint
```

### Clean

```bash
pnpm clean
```

Removes all build artifacts.

## Package Interconnection

This monorepo uses pnpm workspaces to manage inter-package dependencies:

1. **Workspace Protocol**: Package references use `workspace:*`
2. **Auto-linking**: pnpm automatically symlinks local packages
3. **Unified Package**: The `@tstsx` package depends on all individual packages and re-exports their features

Example (`packages/tstsx/package.json`):

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

## Version Management and Publishing

### Changesets Workflow

This project uses [Changesets](https://github.com/changesets/changesets) to automate version management and publishing.

#### 1. Record Changes

After adding features or fixing bugs, create a changeset:

```bash
pnpm changeset
```

When the interactive prompt appears:
1. Select the changed packages
2. Choose version type (major/minor/patch)
3. Write a summary of changes

This command creates a markdown file in the `.changeset` directory.

#### 2. Update Versions

To update versions locally:

```bash
pnpm version-packages
```

This command:
- Updates `package.json` versions for each package
- Automatically generates/updates CHANGELOG.md
- Removes changeset files

#### 3. Publishing

**Local Publishing:**

```bash
pnpm release
```

This builds and publishes to npm.

**Automated Publishing (GitHub Actions):**

1. When you push to the `main` branch, the GitHub Actions workflow runs
2. If there are changesets:
   - Automatically creates a "Version Packages" PR
   - Publishing to npm happens automatically when the PR is merged
3. Publishing uses the `NPM_TOKEN` secret

### Detailed Publishing Process

```
┌─────────────────┐
│ Commit changes  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ pnpm changeset  │ ← Record changes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Push to main    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ GitHub Actions runs     │
│ - Build                 │
│ - Create Version PR     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Merge Version PR        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Auto-publish to npm     │
└─────────────────────────┘
```

## Creating New Packages

To create a new package:

```bash
pnpm create-package
```

An interactive prompt will guide you through package setup.

## Tech Stack

- **Build Tool**: Vite
- **Testing**: Vitest
- **Linter/Formatter**: Biome
- **Type Checker**: TypeScript 5.9
- **Monorepo Tools**: Turbo + pnpm workspace
- **Version Management**: Changesets
- **CI/CD**: GitHub Actions

## Catalog Usage

Common dependency versions are managed using pnpm catalog:

- `catalog:react18` - React 18 dependencies
- `catalog:react19` - React 19 dependencies
- `catalog:core` - Core tools like TypeScript
- `catalog:test` - Vitest, Testing Library, etc.
- `catalog:tools` - Biome, Vite, etc.

## License

MIT
