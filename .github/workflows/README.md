# CI/CD Workflows

## Overview

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### 1. CI (`ci.yml`)

Main CI workflow that runs on:

- Pull requests to `main` branch
- Direct pushes to `main` branch (if allowed)

**Jobs:**

- **Lint**: Runs ESLint and Prettier checks on affected projects
- **Build**: Builds affected projects in production mode
- **Test**: Runs tests on affected projects with coverage

**Optimization**: Uses `nx affected` to only check changed projects based on git diff.

### 2. Lint PR (`lint-pr.yml`)

Dedicated linting workflow for pull requests.

**Features:**

- Shows affected projects in the PR
- Runs ESLint on affected projects only
- Checks code formatting with Prettier
- Posts results as PR comment

**Triggers:**

- PR opened
- PR synchronized (new commits pushed)
- PR reopened

## Nx Affected Strategy

All workflows use `nrwl/nx-set-shas` action to automatically determine:

- **Base SHA**: The commit to compare against (usually main branch)
- **Head SHA**: The current commit being checked

This allows `nx affected` commands to only run tasks on projects impacted by the changes.

## Branch Protection Setup

To enforce these checks, configure branch protection rules for `main`:

### GitHub Repository Settings

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (recommended: 1)
   - ✅ Require status checks to pass before merging
     - Search and add: `lint`, `build`, `test`
   - ✅ Require branches to be up to date before merging
   - ✅ Do not allow bypassing the above settings

### Required Status Checks

Add these required checks:

- `Lint` (from ci.yml)
- `Build` (from ci.yml)
- `Test` (from ci.yml)
- `Lint Affected Projects` (from lint-pr.yml)

## Local Development

Before pushing, run these commands locally:

```bash
# Run lint with auto-fix
yarn lint

# Check formatting
yarn format:check

# Format code
yarn format

# Run affected lint only
npx nx affected -t lint

# Show affected projects
npx nx show projects --affected
```

## Manual Workflow Dispatch

Workflows can be manually triggered from GitHub Actions tab if needed.

## Environment Variables

No special environment variables required for basic workflows.

## Caching

- **Node modules**: Cached using `actions/setup-node@v4` with `cache: 'yarn'`
- **Nx cache**: Automatically managed by Nx Cloud (if configured)

## Timeouts

- Lint job: 10 minutes
- Build job: 15 minutes
- Test job: 15 minutes

## Parallel Execution

All `nx affected` commands run with `--parallel=3` for optimal performance.

## Troubleshooting

### Workflow fails with "No projects affected"

This is expected if changes don't affect any library code (e.g., only README changes).

### SHAs not set correctly

Make sure `fetch-depth: 0` is set in checkout action to fetch full git history.

### Lint failures

Run locally first:

```bash
npx nx affected -t lint --fix
```

### Format failures

Format code locally:

```bash
yarn format
```
