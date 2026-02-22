# GEMINI.md

## Project Overview

**SotbiLibs** is an Nx-based monorepo containing a collection of reusable Angular libraries. It is designed to provide shared services, state management, UI components, and utilities for the Sotbi ecosystem. The project emphasizes strict TypeScript usage, automated testing with Jest, and efficient CI/CD workflows using Nx affected commands.

### Main Technologies

- **Framework:** Angular 20+
- **Monorepo Tooling:** Nx 22.5.0
- **Language:** TypeScript 5.9+
- **State Management:** NGXS 21.0.0
- **Package Manager:** Yarn
- **Testing:** Jest 30+ (migrating from Jasmine)
- **Linting & Formatting:** ESLint (Flat Config), Prettier
- **UI Components:** Angular Material, Clarity Design (@clr/angular), AG Grid

### Architecture & Libraries

The workspace is organized into several key libraries:

- `auth/`: Authentication services, guards, and interceptors.
- `data-access/`: API service wrappers and data fetching logic.
- `models/`: Shared TypeScript interfaces and domain models.
- `state/`: Global state management using NGXS.
- `ui/`: Common UI components and styles.
- `ui-ag-grid/`: Specialized AG Grid integrations and configurations.
- `utils/`: Low-level utility functions and helpers.

---

## Building and Running

### Essential Commands

- **Install Dependencies:** `yarn install`
- **Linting:** `yarn lint` or `npx nx run-many -t lint`
- **Formatting:** `yarn format` (to fix) or `yarn format:check`
- **Testing:** `yarn test` or `npx nx test <project-name>`
- **Building:** `npx nx build <project-name>`
- **Affected Tasks:** `npx nx affected -t <target>` (e.g., `test`, `build`, `lint`)

### CI/CD Pipeline

The project uses GitHub Actions for automated checks on pull requests:

- **Linting & Formatting:** Ensures code quality and consistency.
- **Unit Tests:** Runs tests for affected projects with coverage reports.
- **Build Validation:** Verifies that libraries compile correctly.

---

## Development Conventions

### Coding Standards

- **Strict TypeScript:**
  - Explicit member accessibility (public/private/protected) is required for class members.
  - Avoid `any` type (enforced by ESLint).
  - Prefer `class` over `interface` for type definitions.
  - Prefer `type-only` imports: `import type { ... }`.
- **Naming:** Follow standard Angular and TypeScript naming conventions (PascalCase for classes, camelCase for methods/variables).
- **Module Boundaries:** strictly enforced via `@nx/enforce-module-boundaries` to prevent circular dependencies and maintain architectural integrity.

### Testing Practices

- **Framework:** Jest is the primary test runner.
- **Migration:** Older tests are being migrated from Jasmine to Jest.
  - Use `jest.Mocked<T>` instead of `jasmine.SpyObj<T>`.
  - Use `jest.fn()` for mocks.
  - Avoid `@test-setup` and use standard `TestBed` configurations.
- **Verification:** Always run `npx nx test <project>` after changes to ensure no regressions.

### Git Workflow

- **Branching:** Use feature branches (`feature/my-feature`).
- **Commits:** Direct pushes to `main` are disabled. All changes must go through a Pull Request.
- **PRs:** Must pass all CI checks and receive approval before merging.
