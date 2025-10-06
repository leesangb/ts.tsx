# Contributing to ts.tsx

Thank you for your interest in contributing to ts.tsx! This guide will help you get started.

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

### Clone and Install

```bash
git clone https://github.com/leesangb/ts.tsx.git
cd ts.tsx
pnpm install
```

## Development Workflow

### 1. Create a Branch

Create a new branch for your feature or bugfix:

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Make your changes in the appropriate package directory:

- React packages: `packages/react/`
- Vanilla packages: `packages/vanilla/`
- Unified package: `packages/tstsx/`

### 3. Test Your Changes

Run tests to ensure everything works:

```bash
# Run all tests
pnpm test

# Run tests for a specific package
cd packages/react/your-package
pnpm test
```

### 4. Lint and Format

Before committing, ensure your code passes linting and formatting:

```bash
# Format code
pnpm format

# Check code quality
pnpm check

# Run lint
pnpm lint

# Run typecheck
pnpm typecheck
```

### 5. Commit Your Changes

We use Husky pre-commit hooks to ensure code quality. When you commit, the following checks run automatically:

```bash
git add .
git commit -m "feat: add new feature"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 6. Create a Changeset

If your changes affect any packages, create a changeset:

```bash
pnpm changeset
```

Follow the interactive prompt to:
1. Select the changed packages
2. Choose version type (major/minor/patch)
3. Write a summary of changes

### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Creating New Packages

To create a new package:

```bash
pnpm create-package
```

Follow the interactive prompt to set up your package. The script will:
1. Create the package directory structure
2. Set up TypeScript configuration
3. Add Vite build configuration
4. Update the unified `@tstsx` package

## Project Structure

```
ts.tsx/
├── packages/
│   ├── react/              # React packages
│   │   ├── combined/
│   │   ├── exception-boundary/
│   │   ├── init/
│   │   ├── stack-navigation/
│   │   └── suspensify/
│   ├── vanilla/            # Framework-agnostic packages
│   │   └── object-diff/
│   └── tstsx/              # Unified package
├── scripts/                # Build and utility scripts
├── .changeset/             # Changeset files
└── .github/                # GitHub Actions workflows
```

## Testing Guidelines

- Write tests for all new features
- Ensure existing tests pass
- Use Vitest for testing
- Follow the existing test patterns in each package

## Code Style

- Use TypeScript for all code
- Follow the existing code style (enforced by Biome)
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Prefer type safety over convenience

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Create a changeset for version tracking
4. Fill out the PR template
5. Wait for review from maintainers
6. Address any feedback
7. Once approved, maintainers will merge your PR

## Version Management

This project uses [Changesets](https://github.com/changesets/changesets) for version management:

1. Contributors create changesets when making changes
2. Changesets are reviewed along with the PR
3. When merged to `main`, GitHub Actions creates a "Version Packages" PR
4. Merging the Version PR automatically publishes to npm

## Getting Help

- Open an issue for bug reports or feature requests
- Ask questions in discussions
- Review existing issues and PRs

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## License

By contributing to ts.tsx, you agree that your contributions will be licensed under the MIT License.
