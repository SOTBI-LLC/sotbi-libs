# Запуск тестов

## Локальный запуск

### Все проекты

```bash
# Запустить все тесты
yarn test

# С покрытием кода
yarn test:coverage
```

### Конкретный проект

```bash
# Тесты для auth
npx nx test auth --watch=false

# Тесты для data-access
npx nx test data-access --watch=false

# С покрытием
npx nx test auth --watch=false --coverage
```

### Watch-режим для разработки

```bash
# Запустить в watch-режиме
npx nx test auth
```

## CI/CD

Тесты автоматически запускаются в GitHub Actions при создании PR или push в main:

- Используется `nx affected -t test` для запуска только измененных проектов
- Включено покрытие кода (`--coverage`)
- Результаты сохраняются в `coverage/`

## Конфигурация

- **Workspace**: `jest.config.ts` и `jest.preset.js`
- **Проекты**: `auth/jest.config.ts`, `data-access/jest.config.ts`
- **Test setup**: каждый проект имеет `src/test-setup.ts`

## Текущее состояние

✅ **Jest настроен и работает**
✅ **47 тестов прошло** в библиотеке auth
✅ **CI/CD интеграция** готова

### Известные проблемы

Некоторые тесты используют Jasmine-специфичные утилиты (`jasmine.SpyObj`, `@test-setup`), которые не совместимы с Jest. Эти тесты нужно будет мигрировать на Jest mocks:

- `auth/src/lib/interceptors/auth.interceptor.spec.ts`
- `data-access/src/lib/access.service.spec.ts`
- `data-access/src/lib/user.service.spec.ts`

### Миграция тестов

Для миграции Jasmine тестов на Jest:

1. Заменить `jasmine.SpyObj<T>` на `jest.Mocked<T>`
2. Использовать `jest.fn()` вместо `jasmine.createSpy()`
3. Удалить зависимость от `@test-setup` и использовать стандартные утилиты Jest

## Отчеты о покрытии

Отчеты сохраняются в `coverage/{projectName}/`:

```bash
# Просмотр HTML отчета
open coverage/auth/index.html
```
