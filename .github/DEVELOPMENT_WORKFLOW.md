# Development Workflow

Руководство по процессу разработки в проекте с настроенными CI/CD проверками.

## Быстрый старт

### 1. Установка зависимостей

```bash
yarn install
```

### 2. Проверка перед началом работы

```bash
# Убедитесь что основная ветка актуальна
git checkout main
git pull origin main
```

## Процесс разработки

### Шаг 1: Создание feature-ветки

```bash
# Создать новую ветку от main
git checkout main
git checkout -b feature/short-description

# Примеры имен веток:
# feature/add-auth-interceptor
# fix/login-validation
# refactor/user-service
# docs/update-readme
```

### Шаг 2: Разработка с локальными проверками

#### Проверка во время разработки

```bash
# Посмотреть какие проекты затронуты
npx nx show projects --affected

# Запустить линтер только для затронутых проектов
npx nx affected -t lint

# С автоматическим исправлением
npx nx affected -t lint --fix

# Запустить тесты для затронутых проектов
npx nx affected -t test

# Собрать затронутые проекты
npx nx affected -t build
```

#### Проверка конкретного проекта

```bash
# Линтинг конкретной библиотеки
nx run auth:lint --fix
nx run data-access:lint --fix
nx run models:lint

# Тесты конкретного проекта
nx run auth:test
nx run data-access:test

# Сборка конкретного проекта
nx run auth:build
```

#### Полная проверка всех проектов

```bash
# Линтинг всех проектов
yarn lint

# Проверка форматирования
yarn format:check

# Автоматическое форматирование
yarn format

# Все вместе (перед созданием PR)
yarn lint && yarn format:check
```

### Шаг 3: Коммит изменений

```bash
# Добавить файлы
git add .

# Коммит с описательным сообщением
git commit -m "feat: add user authentication service"

# Примеры commit messages:
# feat: add new feature
# fix: resolve bug in auth guard
# refactor: improve code structure
# docs: update API documentation
# test: add unit tests for service
# chore: update dependencies
```

### Шаг 4: Push и создание PR

```bash
# Отправить ветку на GitHub
git push origin feature/short-description

# Если ветка уже существует и нужно обновить
git push origin feature/short-description --force-with-lease
```

После push:

1. Откройте GitHub репозиторий
2. Увидите кнопку **"Compare & pull request"**
3. Заполните PR template:
   - Описание изменений
   - Тип изменения (bug fix, feature, etc.)
   - Связанные issues
   - Затронутые проекты
   - Чек-лист

### Шаг 5: Мониторинг CI/CD

После создания PR автоматически запустятся проверки:

#### Проверки в `ci.yml`

- ✅ **Lint**: ESLint проверка кода
- ✅ **Build**: Сборка проектов
- ✅ **Test**: Выполнение тестов

#### Проверки в `lint-pr.yml`

- ✅ **Lint Affected Projects**: Детальная проверка линтинга
- ✅ **Code formatting**: Проверка форматирования

**Просмотр статуса**:

- В PR будут видны статусы всех проверок
- Кликните "Details" чтобы увидеть логи
- Бот добавит комментарий с результатами линтинга

### Шаг 6: Исправление ошибок CI/CD

Если проверки провалились:

```bash
# 1. Посмотреть логи в GitHub Actions
# 2. Воспроизвести ошибку локально

# Запустить те же команды что и CI
npx nx affected -t lint --base=origin/main --head=HEAD
npx nx affected -t test --base=origin/main --head=HEAD
npx nx affected -t build --base=origin/main --head=HEAD

# 3. Исправить ошибки
# 4. Закоммитить исправления
git add .
git commit -m "fix: resolve linting errors"
git push origin feature/short-description

# Проверки запустятся автоматически заново
```

### Шаг 7: Code Review

После успешного прохождения CI/CD:

1. Дождитесь review от коллег (см. CODEOWNERS)
2. Внесите правки если требуется
3. Push изменений (CI запустится снова)
4. Получите approval

### Шаг 8: Merge

После approval и прохождения всех проверок:

1. Кнопка **"Merge pull request"** станет активной
2. Выберите тип merge:
   - **Squash and merge** (рекомендуется) - все коммиты в один
   - **Rebase and merge** - линейная история
   - **Create a merge commit** - сохранить все коммиты
3. Нажмите merge
4. Удалите feature-ветку (автоматически предложится)

## Дополнительные команды

### Nx команды для анализа

```bash
# Визуализация графа зависимостей
npx nx graph

# Визуализация затронутых проектов
npx nx affected:graph

# Показать все проекты
npx nx show projects

# Показать затронутые проекты
npx nx show projects --affected

# Информация о конкретном проекте
npx nx show project auth --web
```

### Работа с git

```bash
# Обновить ветку от main
git checkout feature/my-feature
git merge origin/main

# Или rebase (для линейной истории)
git rebase origin/main

# Отменить последний коммит (сохранив изменения)
git reset --soft HEAD~1

# Изменить последний commit message
git commit --amend -m "new message"
```

### Отладка проблем

```bash
# Очистить кэш Nx
npx nx reset

# Запустить без кэша
npx nx affected -t lint --skip-nx-cache

# Подробный вывод
npx nx affected -t lint --verbose

# Сравнение конкретных коммитов
npx nx affected -t lint --base=abc123 --head=def456
```

## Best Practices

### ✅ DO

- **Проверяйте локально** перед push
- **Пишите описательные commit messages**
- **Держите PR небольшими** (до 400 строк изменений)
- **Обновляйте ветку** от main регулярно
- **Исправляйте CI ошибки** сразу
- **Отвечайте на review комментарии** быстро
- **Используйте nx affected** для оптимизации

### ❌ DON'T

- **Не пушьте в main** напрямую (запрещено protection rules)
- **Не игнорируйте линтер** ошибки
- **Не создавайте огромные PR** (hard to review)
- **Не force push** после получения review
- **Не коммитьте** закомментированный код
- **Не оставляйте** console.log в production коде
- **Не пропускайте** тесты

## Типы коммитов (Conventional Commits)

Используйте префиксы для commit messages:

- `feat:` - новая функциональность
- `fix:` - исправление бага
- `refactor:` - рефакторинг без изменения функциональности
- `docs:` - изменения в документации
- `test:` - добавление или изменение тестов
- `chore:` - рутинные задачи (обновление зависимостей)
- `style:` - форматирование кода
- `perf:` - улучшение производительности
- `ci:` - изменения CI/CD конфигурации

Примеры:

```bash
git commit -m "feat: add JWT token refresh mechanism"
git commit -m "fix: resolve null pointer in auth guard"
git commit -m "refactor: extract common logic to utility"
git commit -m "docs: update API endpoints documentation"
git commit -m "test: add unit tests for user service"
```

## Troubleshooting

### Проблема: "remote rejected protected branch"

```bash
# Причина: Пытаетесь пушить в main напрямую
# Решение: Создайте feature-ветку
git checkout -b feature/my-changes
git push origin feature/my-changes
```

### Проблема: Merge conflicts

```bash
# Обновить от main
git checkout feature/my-feature
git fetch origin
git merge origin/main

# Разрешить конфликты в файлах
# После разрешения:
git add .
git commit -m "merge: resolve conflicts with main"
git push origin feature/my-feature
```

### Проблема: CI проходит локально, но падает в GitHub

```bash
# Причина: Разные версии зависимостей или окружение
# Решение: Запустить в том же окружении что CI

# Убедитесь что используется yarn.lock
yarn install --frozen-lockfile

# Запустите с теми же флагами что CI
npx nx affected -t lint --base=origin/main --parallel=3
```

### Проблема: Nx не видит изменения

```bash
# Очистить кэш
npx nx reset

# Проверить что base и head корректны
git log --oneline -n 10

# Явно указать base
npx nx affected -t lint --base=origin/main --head=HEAD
```

## Ссылки

- [GitHub Workflows](.github/workflows/README.md)
- [Branch Protection Setup](.github/BRANCH_PROTECTION.md)
- [ESLint Rules](../.cursor/rules/eslint-rules.mdc)
- [Nx Workspace](../.cursor/rules/nx-workspace.mdc)
