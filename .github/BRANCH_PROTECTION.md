# Branch Protection Rules

## Настройка защиты ветки `main`

Для обеспечения качества кода и автоматических проверок необходимо настроить правила защиты для ветки `main`.

## Пошаговая инструкция

### 1. Открыть настройки репозитория

1. Перейдите в репозиторий на GitHub
2. Нажмите **Settings** (Настройки)
3. В боковом меню выберите **Branches** (Ветки)

### 2. Добавить правило для ветки

1. Нажмите **Add branch protection rule**
2. В поле **Branch name pattern** введите: `main`

### 3. Настроить требования

Включите следующие опции:

#### Требования к Pull Request

- ✅ **Require a pull request before merging**

  - Запрещает прямой push в main
  - Все изменения должны проходить через PR

- ✅ **Require approvals**

  - Минимум: **1** reviewer
  - Рекомендуется для командной разработки

- ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - Сбрасывает одобрение при новых коммитах

#### Требования к статус-проверкам

- ✅ **Require status checks to pass before merging**

  - Обязательные проверки CI/CD должны пройти успешно

- ✅ **Require branches to be up to date before merging**
  - Ветка должна быть актуальной перед мержем

**Добавьте следующие обязательные проверки:**

1. `Lint` - из workflow `ci.yml`
2. `Build` - из workflow `ci.yml`
3. `Test` - из workflow `ci.yml`
4. `Lint Affected Projects` - из workflow `lint-pr.yml`

> **Примечание**: Проверки появятся в списке только после первого запуска workflow

#### Дополнительные ограничения

- ✅ **Do not allow bypassing the above settings**

  - Даже администраторы должны следовать правилам
  - Рекомендуется для строгого контроля качества

- ⚠️ **Allow force pushes** (оставить выключенным)

  - Запрещает force push в main

- ⚠️ **Allow deletions** (оставить выключенным)
  - Запрещает удаление ветки main

### 4. Сохранить правило

Нажмите **Create** или **Save changes** внизу страницы.

## Рабочий процесс после настройки

### Для разработчиков

1. **Создать feature-ветку**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Внести изменения и закоммитить**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Проверить локально перед push**

   ```bash
   # Запустить линтер
   yarn lint

   # Проверить форматирование
   yarn format:check

   # Запустить тесты
   yarn test

   # Проверить только затронутые проекты
   npx nx affected -t lint
   npx nx show projects --affected
   ```

4. **Отправить ветку**

   ```bash
   git push origin feature/my-feature
   ```

5. **Создать Pull Request**

   - Откройте GitHub
   - Нажмите "Compare & pull request"
   - Заполните шаблон PR
   - Дождитесь прохождения CI/CD проверок

6. **Дождаться review и мержа**
   - После одобрения reviewer
   - После успешного прохождения всех проверок
   - Нажмите "Merge pull request"

### Что происходит при создании PR

1. **Автоматические проверки запускаются**:

   - ESLint проверяет код на ошибки
   - Prettier проверяет форматирование
   - Тесты запускаются
   - Проекты собираются

2. **Nx оптимизирует проверки**:

   - Анализируются только затронутые проекты
   - Экономится время CI/CD

3. **Результаты публикуются**:

   - Статус проверок отображается в PR
   - Комментарий с результатами линтинга добавляется автоматически

4. **Merge блокируется если**:
   - Есть ошибки линтинга
   - Тесты провалились
   - Сборка не удалась
   - Нет одобрения reviewer (если настроено)

## Обход правил (только для администраторов)

Если необходимо срочное исправление:

1. **Временно отключить правило**:

   - Settings → Branches → Edit rule
   - Снять галочки с нужных проверок
   - Сделать коммит
   - Вернуть правила обратно

2. **Использовать hotfix workflow** (если настроен):
   - Создать ветку `hotfix/*`
   - Настроить отдельные правила для hotfix

> ⚠️ **Внимание**: Обход правил должен быть исключением, не правилом!

## Проверка настроек

После настройки проверьте:

1. **Попытаться сделать прямой push в main**:

   ```bash
   git checkout main
   git commit --allow-empty -m "test"
   git push
   # Должна быть ошибка: protected branch
   ```

2. **Создать тестовый PR**:
   - Создайте feature-ветку
   - Внесите изменения
   - Создайте PR
   - Убедитесь что проверки запустились

## Мониторинг

- Проверяйте статус workflow в **Actions** tab
- Настройте уведомления для провалившихся проверок
- Просматривайте логи для диагностики проблем

## Troubleshooting

### PR не может быть смержен

**Проблема**: Кнопка "Merge" неактивна

**Решение**:

1. Проверьте статус всех required checks
2. Убедитесь что есть одобрение reviewer
3. Обновите ветку если требуется

### Проверки не запускаются

**Проблема**: Workflow не стартует при создании PR

**Решение**:

1. Проверьте что workflow файлы в `.github/workflows/`
2. Убедитесь что ветка указана правильно в `on.pull_request.branches`
3. Проверьте синтаксис YAML файлов

### Все проверки проходят, но merge заблокирован

**Проблема**: Status checks пройдены, но merge недоступен

**Решение**:

1. Проверьте что добавлены правильные required checks
2. Обновите ветку с main (`git merge main`)
3. Дождитесь повторного запуска проверок

## Дополнительные ресурсы

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nx Affected Commands](https://nx.dev/concepts/affected)
