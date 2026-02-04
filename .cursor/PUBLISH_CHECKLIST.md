# Чеклист для публикации пакетов в GitHub Packages

## ✅ Что уже проверено:

1. ✅ **Ваши права в репозитории**: ADMIN (достаточно)
2. ✅ **Репозиторий**: SOTBI-LLC/sotbi-libs (приватный)
3. ✅ **package.json**: Все настроены с publishConfig
4. ✅ **GitHub Actions workflow**: Создан `.github/workflows/publish.yml`

## 🔍 Что нужно проверить вручную:

### 1. Настройки Actions в репозитории
**URL**: https://github.com/SOTBI-LLC/sotbi-libs/settings/actions

Проверьте:
- [ ] **Actions permissions**: "Allow all actions and reusable workflows" включено
- [ ] **Workflow permissions**: Выбрано "Read and write permissions"
- [ ] **Allow GitHub Actions to create and approve pull requests**: включено

### 2. Настройки пакетов в организации
**URL**: https://github.com/orgs/SOTBI-LLC/settings/packages

Проверьте:
- [ ] **Package creation**: 
  - ✅ "Public" - включено (уже проверили на скриншоте)
  - ✅ "Internal" - включено (уже проверили на скриншоте)
  - ❓ "Private" - включите если нужны приватные пакеты
- [ ] **Inherit access from source repository**: включено (уже видно на скриншоте)

### 3. Проверьте токен в .npmrc
**Файл**: `/Users/bazys/Projects/sotbi/sotbi-libs/.npmrc`

Убедитесь что токен:
- [ ] Имеет scope `repo`
- [ ] Имеет scope `write:packages`
- [ ] Имеет scope `read:packages`
- [ ] Не истёк
- [ ] Если у SOTBI-LLC включен SAML SSO - токен авторизован для организации

**Проверить токен**: https://github.com/settings/tokens

## 🚀 Способы публикации:

### Способ 1: GitHub Actions (РЕКОМЕНДУЕТСЯ)

**Преимущества**: Автоматические права, не нужно настраивать токены

1. Перейдите: https://github.com/SOTBI-LLC/sotbi-libs/actions/workflows/publish.yml
2. Нажмите "Run workflow"
3. Выберите branch "main"
4. Нажмите "Run workflow"

### Способ 2: Через тег (автоматически)

```bash
git tag v0.0.1
git push origin v0.0.1
```

GitHub Actions автоматически запустится при создании тега.

### Способ 3: Локально через Nx

```bash
nx run utils:build
nx run utils:nx-release-publish
```

**Требует**: Правильный токен в `.npmrc` с нужными правами

## ❌ Текущая ошибка:

```
403 Forbidden - Permission permission_denied: create_package
```

**Возможные причины**:
1. Токен в `.npmrc` не имеет scope `write:packages`
2. Токен не авторизован для организации (SAML SSO)
3. В настройках организации не включены Private packages (если используете access: restricted)

## 💡 Решение:

**Используйте GitHub Actions** - там права настроены автоматически через `GITHUB_TOKEN`!
