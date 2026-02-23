# SotbiLibs

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run tasks

To run tasks with Nx use:

```sh
npx nx <target> <project-name>
```

For example:

```sh
npx nx build myproject
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

To install a new plugin you can use the `nx add` command. Here's an example of adding the React plugin:

```sh
npx nx add @nx/react
```

Use the plugin's generator to create new projects. For example, to create a new React app or library:

```sh
# Generate an app
npx nx g @nx/react:app demo

# Generate a library
npx nx g @nx/react:lib some-lib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Development Workflow

This project uses GitHub Actions for CI/CD with automated checks on pull requests.

### Quick Start

```bash
# Install dependencies
yarn install

# Run linter
yarn lint

# Check formatting
yarn format:check

# Format code
yarn format
```

### Working with Feature Branches

```bash
# Create feature branch
git checkout -b feature/my-feature

# Check affected projects
npx nx show projects --affected

# Run lint on affected projects
npx nx affected -t lint --fix

# Push and create PR
git push origin feature/my-feature
```

**Read the full workflow guide:** [Development Workflow](.github/DEVELOPMENT_WORKFLOW.md)

## CI/CD Pipeline

### Automated Checks

All pull requests to `main` automatically run:

- ✅ **ESLint** - Code quality and style checks
- ✅ **Prettier** - Code formatting verification
- ✅ **Tests** - Unit tests with coverage
- ✅ **Build** - Production build validation

### Branch Protection

Direct push to `main` is **disabled**. All changes must:

1. Go through a Pull Request
2. Pass all CI/CD checks
3. Get approval from code reviewer
4. Have up-to-date branch with `main`

**Setup instructions:** [Branch Protection](.github/BRANCH_PROTECTION.md)

### Nx Affected Optimization

CI/CD uses `nx affected` to run checks only on changed projects, making the pipeline fast and efficient.

## Project Structure

This workspace contains the following libraries:

- `auth` - Authentication services and guards
- `data-access` - Data access services
- `models` - TypeScript interfaces and models
- `state` - NGXS state management
- `ui` - UI components
- `ui-ag-grid` - AG Grid components
- `utils` - Utility functions

## Documentation

- [Development Workflow](.github/DEVELOPMENT_WORKFLOW.md) - Complete development guide
- [Branch Protection Setup](.github/BRANCH_PROTECTION.md) - GitHub configuration
- [CI/CD Workflows](.github/workflows/README.md) - GitHub Actions documentation
- [ESLint Rules](.cursor/rules/eslint-rules.mdc) - Linting configuration
- [Nx Workspace](.cursor/rules/nx-workspace.mdc) - Workspace conventions

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

    "@sotbi/utils": "file:./dist/utils",
    "@sotbi/models": "file:./dist/models",
