# @sotbi/ui

Переиспользуемые UI-компоненты без зависимости от сервисов приложений.
Приложение предоставляет данные и обработчики; пакет не выполняет HTTP-запросов
и не хранит доменное состояние.

Зависимости (peerDependencies): Angular 22.x, Clarity 18.3.x,
ngx-file-drop 16.x, @ng-select, @sotbi/models, @sotbi/utils, rxjs. Стили
подключаются через `@sotbi/ui/styles.css`.

## CSS для приложения с собственным каскадом

Помимо прежнего `@sotbi/ui/styles.css`, пакет экспортирует
`@sotbi/ui/styles-composable.css`. Используйте **один** из этих файлов.

- `styles.css` — прежний полный набор: Tailwind preflight, слои и важные
  декларации сохраняются для существующих потребителей.
- `styles-composable.css` — те же токены, утилиты и правила компонентов/иконок,
  но без слоя `base` (preflight), директив `@layer` и важных деклараций.
  Инициализация CSS properties Tailwind и `@property` сохраняются.
  Это глобальный CSS, а не изолированная тема: слой и приоритет задаёт потребитель.

Пример подключения в приложении с Clarity и Tailwind-first каскадом:

```css
@layer theme, vendor, base, components, overrides, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import '@clr/ui/clr-ui.min.css' layer(vendor);
@import '@sotbi/ui/styles-composable.css' layer(vendor);
@import 'tailwindcss/utilities.css' layer(utilities);
```

Базовые стили форм и типографики предоставляет Clarity или само приложение.
При переходе проверить формы, ng-select и Lucide: в новом экспорте намеренно
нет `!important`, поэтому важные правила других библиотек сохраняют приоритет.
Не подключайте одновременно полный экспорт: он снова добавит preflight.

Оба файла генерируются одной целью `yarn nx run ui:build-styles` из общего
источника `ui/src/styles.css`; вручную редактировать их не нужно.
`yarn nx run ui:test-styles` проверяет контракт подготовленного CSS;
эта проверка также входит в `ui:test`.

## PaymentsFileButtonsComponent

Кнопки файловых действий. Селектор: `pauments-file-buttons` (историческое
написание сохранено). Экспортируется также под старым именем
`PaumentsFileButtonsComponent`.

```ts
import { PaumentsFileButtonsComponent } from '@sotbi/ui';
```

```html
<pauments-file-buttons
  [uploadState]="uploadState()"
  (filesSelected)="onFiles($event)"
  (exportRequested)="onExport()"
/>
```

- `uploadState: number (LoadingButtonState)` — состояние кнопок; при `LOADING` они disabled.
- `filesSelected: File[]` — выбранные файлы (повторный выбор тех же файлов
  выдаёт новое событие).
- `exportRequested: void` — нажатие «Скачать». Загрузка и создание задачи
  выгрузки остаются в обработчиках приложения.

## DialogHistoryComponent

Диалог истории изменений. История загружается переданной функцией, подписи
полей передаются словарём приложения.

```ts
import { DialogHistoryComponent, DialogHistoryDataModel } from '@sotbi/ui';

this.dialog.open(DialogHistoryComponent, {
  data: {
    title: 'История изменений',
    info: id,
    loadHistory: (attachmentId: number) =>
      this.attachments.history(attachmentId),
    fieldLabels: attachmentHistoryFields, // необязательный словарь приложения
  } satisfies DialogHistoryDataModel,
});
```

- `fieldLabels?: Record<string, string>` — подписи полей; для неизвестного поля
  отображается исходный ключ; без словаря — ключи без замен.
- История без изменений показывает «Изменений нет».

## RemainingDialogComponent

Диалог выписки по счёту: просмотр либо редактирование (загрузка PDF).

```ts
import { RemainingDialogComponent, RemainingDialogData } from '@sotbi/ui';

// Редактирование: обработчик загрузки обязателен
const data = {
  row,
  caption: 'Загрузить PDF файл',
  isEdit: true,
  uploadStatement: (formData: FormData) => this.uploadSrv.uploadPdf(formData),
} satisfies RemainingDialogData;

// Просмотр: обработчик не нужен
const dataView = {
  row,
  caption: 'Подробнее',
  isEdit: false,
  // statementUrl: '/custom/statement/42', — необязательная ссылка на файл;
  // по умолчанию /download/payment/<id>
} satisfies RemainingDialogData;
```

- При отправке передаётся `FormData` с полями `account`, `start_date`,
  `end_date` (формат `yyyy-MM-dd`) и `files`; диалог закрывается с результатом
  обработчика.
- Ошибка загрузки отображается в диалоге, диалог остаётся открытым.
- Отмена закрывает диалог без результата загрузки.

## Clarity CSS и иконки

Компоненты на разметке Clarity (`PaymentsFileButtons`, `RemainingDialog`,
`Header`, `LeftNavBar`) требуют в приложении-потребителе стилей
`@clr/ui/clr-ui.min.css` и `@sotbi/ui/styles.css`. Иконки — компоненты
`@lucide/angular` (`<svg lucideX>`, peer-зависимость); `@sotbi/ui/styles.css`
переносит на `svg.lucide` оформление иконок Clarity (размеры, цвета, `data-size`,
`data-direction`, `data-status`). `@clr/angular` не требуется.

## HeaderComponent

Шапка приложения. Селектор: `sotbi-header`. Компонент работает только от
переданных данных: без AuthService, NGXS и ресурсов приложений. Логотип
передаёт потребитель.

```ts
import {
  HeaderComponent,
  HeaderBrand,
  HeaderUser,
  HeaderLink,
} from '@sotbi/ui';
```

```html
<sotbi-header
  [loggedIn]="loggedIn()"
  [brand]="brand"
  [user]="user()"
  [items]="items()"
  [accountItems]="accountItems()"
  [online]="online()"
  [showSearch]="showSearch()"
  [phrase]="phrase()"
  (searchEvent)="onSearch($event)"
  (logoutRequested)="onLogout()"
/>
```

### Inputs и outputs

- `loggedIn: boolean = false` — видимость шапки; при `false` содержимое
  не отображается.
- `brand: HeaderBrand` — обязательный; `{ title, logoUrl, homeLink }`,
  задаётся потребителем (в timetable это Our Zoo и `/assets/images/our_zoo.svg`).
- `user: HeaderUser | null = null` — `{ name, avatarUrl? }`; безопасно при
  отсутствии данных.
- `items: HeaderLink[] = []` — уже разрешённые основные ссылки в нужном
  порядке (`{ label, routerLink }`); компонент не фильтрует и не дополняет
  меню.
- `accountItems: HeaderLink[] = []` — уже разрешённые ссылки пользовательского
  меню; «Выход» добавляется компонентом.
- `online: boolean = false`, `showSearch: boolean = false`, `phrase: string = ''`
  — прежние параметры поиска; поле появляется по `showSearch` и получает
  значение `phrase`.
- `searchEvent: string` — отправка формы выдаёт строку немедленно; при
  `online=true` последняя введённая строка выдаётся через 500 мс после ввода.
- `logoutRequested: void` — выбор «Выход»; завершение сессии и переходы
  остаются за потребителем.

### Стили и иконки

- Требуются стили Clarity (`@clr/ui/clr-ui.min.css`) и `@sotbi/ui/styles.css`.
- Ширина поля поиска задаётся локальным правилом `.focus-item` компонента
  (медиазапросы по ширине экрана).
- Иконки — компоненты `@lucide/angular`, регистрация не требуется.

## LeftNavBarComponent

Боковая навигация на `clr-vertical-nav`. Селектор: `left-nav-bar`.

```ts
import {
  LeftNavBarComponent,
  LeftNavBarItem,
  filterItems,
  countWithChildren,
} from '@sotbi/ui';
```

```html
<left-nav-bar [items]="items" [colabsible]="true" />
```

### Inputs

- `items: LeftNavBarItem[]` — обязательный; меню приложения с уже применённой
  фильтрацией прав (компонент не проверяет доступ сам).
- `colabsible: boolean = true` — возможность свернуть панель (историческое
  написание сохранено).

### LeftNavBarItem

```ts
interface LeftNavBarItem {
  label: string;
  icon?: string;
  routerLink?: string;
  access?: string;
  expanded?: boolean;
  children?: LeftNavBarItem[];
}
```

- Панель отображается только при количестве конечных пунктов больше одного.
- Активная конечная ссылка определяется точным совпадением маршрута;
  при отсутствии `routerLink` используется `/`.
- Группа раскрывается по `expanded` и кнопкой пользователя.

### Чистые функции дерева меню

- `countWithChildren(items)` — рекурсивно считает конечные пункты; группа
  с пустыми `children` считается конечным пунктом.
- `filterItems(items, checkAccess)` — возвращает отфильтрованное дерево,
  не изменяя исходное. Проверяется непустой `access`, иначе непустой
  `routerLink`; для пункта без обоих значений predicate не вызывается.
  Запрещённый родитель исключается вместе с поддеревом, группы без
  оставшихся дочерних пунктов — тоже.

```ts
items = filterItems(config, (key) => this.access.has(key));
```

### Стили и иконки

- Высоту навигации задаёт контейнер приложения; в timetable это
  `.content-container .clr-vertical-nav { height: 100% }`. Скопируйте
  эквивалентное правило в стили потребителя.
- `icon` — данные иконки Lucide (`LucideIconData`), регистрация не требуется:

```ts
import { LucideUser } from '@lucide/angular';

const items: LeftNavBarItem[] = [
  { label: 'Сотрудники', icon: LucideUser.icon, routerLink: '/staff' },
];
```

## AttachmentsPipe

Impure-пайп фильтрации вложений по типу. Имя: `attachments`.

- `transform(items, filter)` — возвращает вложения с совпадающим `type`;
  при пустом фильтре или отсутствии списка возвращает вход без изменений.
- `pure: false` — результат пересчитывается на каждом цикле change detection,
  поэтому мутации массива на месте отражаются в представлении.

```html
@for (file of attachments | attachments: 'egrn'; track file) { ... }
```

## ProgressBarComponent

Прогресс выполнения. Селектор: `progress-bar`.

- `progress: Progress` (required) — `{ value, status }`; `status` — массив
  состояний сегментов: значения больше нуля зелёные, ноль — красный.
- `showProgress: boolean` (required) — сегментированный бар при `true`,
  обычный Clarity-прогресс-бар при `false`.

Стили компонента самодостаточны и не требуют глобальных классов приложения.

## SelectedProjectsComponent

Блок избранных проектов на дереве Clarity. Селектор: `selected-projects`.

- `all: string` — счётчик выбранных (передаёт потребитель).
- `projects: Partial<Project>[]` — избранные проекты с должниками.
- `selectFav: void` — нажатие кнопки «Выбрать».

Иконка `star` должна быть зарегистрирована потребителем.

## ProjectDebtorTreeComponent

Дерево проектов и должников с поиском и отметками. Селектор:
`project-debtor-tree`.

### Inputs и outputs

- `all: number` — знаменатель счётчика выбранных.
- `checkedItems: Project[]` — предвыбранные элементы (применяются на init).
- `projects: Project[]` — источник дерева (сеттер; повторная установка
  восстанавливает выбор после обновления данных).
- `selected: Partial<Project>[]` — текущий выбор после любой отметки,
  «выбрать всё» или очистки.

### Поведение

- Поиск фильтрует дерево с задержкой 500 мс; пустая фраза возвращает
  полное дерево.
- Чекбокс «Всё» выбирает все проекты и должников; кнопка очистки блока
  сбрасывает выбор и выдаёт пустой массив.
- Публичный метод `setSelectedItems(numbers: number[])` отмечает элементы
  по идентификаторам.

### Стили

Стили дерева (`.tree`, `.subtree` и правила узлов Clarity через
`::ng-deep`) встроены в компонент и не требуют глобальных классов.

## RangeDateComponent

Выбор периода с пресетами и датапикерами. Селектор: `range-date`.

### Inputs и outputs

- `start: Date`, `end: Date` — границы периода (двусторонние через
  `nativeDate`-аксессоры).
- `analytics: boolean` — режим аналитики: другие пресеты (3 месяца,
  текущий год, 3 года, вся история) и старт с 1-го числа предыдущего
  месяца; при `false` — пресеты «сегодня», «вчера», «с пнд», «неделя»,
  «с 1-го», «месяц».
- `loading: boolean`, `showButton: boolean` — состояние и видимость
  кнопки «получить данные».
- `selected: Interval` — выбор пресета.
- `selectedFromDataPicker: Interval` — изменение дат вручную; границы
  упорядочиваются (start ≤ end).
- `confirm: void` — нажатие «получить данные».

### Форматирование периода

Строка «Выбрано: …» форматируется через `Intl.DateTimeFormat('ru-RU')`
с общими частями диапазона (например «1 – 31 октября 2026 г.»); при
отсутствии `end` — «период не выбран». Зависимость от fullcalendar
не используется.

## Общие токены темы

`@sotbi/ui/tokens.css` предоставляет семантические цвета, размеры подписей форм,
компактного select и переменные размеров/типографики контролов Clarity.
Подключение для Tailwind v4 — перед локальной темой потребителя:

```css
@import '@sotbi/ui/tokens.css';
@import './styles/tokens.css';
```

Файл содержит `@theme inline static` и переменные контролов в слое `theme`;
preflight и порядок каскадных слоёв он не объявляет. Обычные собранные экспорты
`styles.css` и `styles-composable.css` также включают эти переменные.
Размеры страниц, брейкпоинты и цвета конкретных разделов остаются у потребителя.
Имена и значения перенесённых из timetable токенов сохранены; link/danger/success
сохраняют исходные оттенки, отличающиеся от стандартных Clarity.

### Каскад CollapsibleBlock

CSS CollapsibleBlock находится в `@layer components`: потребитель может задавать компактные отступы и цвета кнопок через свой слой `overrides`, а утилиты остаются сильнее компонента. Фон заголовка использует `--color-section-header`; без этого токена сохраняется прежний `#ddd`. В приложениях с общей темой Sotbi применяется семантический цвет заголовка.
