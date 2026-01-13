#!/bin/bash
set -e

echo "Generating TypeScript libraries..."
npx nx g @nx/js:library models --publishable --importPath=@sotbi/models --bundler=tsc --unitTestRunner=none --no-interactive
npx nx g @nx/js:library utils --publishable --importPath=@sotbi/utils --bundler=tsc --unitTestRunner=none --no-interactive

echo "Generating Angular libraries..."
npx nx g @nx/angular:library auth --publishable --importPath=@sotbi/auth --standalone --unitTestRunner=none --no-interactive
npx nx g @nx/angular:library data-access --publishable --importPath=@sotbi/data-access --standalone --unitTestRunner=none --no-interactive
npx nx g @nx/angular:library ui --publishable --importPath=@sotbi/ui --standalone --style=scss --unitTestRunner=none --no-interactive
npx nx g @nx/angular:library ui-ag-grid --publishable --importPath=@sotbi/ui-ag-grid --standalone --style=scss --unitTestRunner=none --no-interactive
npx nx g @nx/angular:library state --publishable --importPath=@sotbi/state --standalone --unitTestRunner=none --no-interactive

echo "All libraries generated successfully!"
