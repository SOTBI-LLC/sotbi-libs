# @sotbi/ui

Переиспользуемые UI-компоненты без зависимости от сервисов приложений.
Приложение предоставляет данные и обработчики; пакет не выполняет HTTP-запросов
и не хранит доменное состояние.

Зависимости (peerDependencies): Angular 22.x, Angular Material, Clarity 18.3.x,
ngx-file-drop 16.x, @ng-select, @sotbi/models, @sotbi/utils, rxjs. Стили
подключаются через `@sotbi/ui/styles.css`.

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

- `uploadState: ClrLoadingState` — состояние кнопок; при `LOADING` они disabled.
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
    loadHistory: (attachmentId: number) => this.attachments.history(attachmentId),
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
  row, caption: 'Загрузить PDF файл', isEdit: true,
  uploadStatement: (formData: FormData) => this.uploadSrv.uploadPdf(formData),
} satisfies RemainingDialogData;

// Просмотр: обработчик не нужен
const dataView = {
  row, caption: 'Подробнее', isEdit: false,
  // statementUrl: '/custom/statement/42', — необязательная ссылка на файл;
  // по умолчанию /download/payment/<id>
} satisfies RemainingDialogData;
```

- При отправке передаётся `FormData` с полями `account`, `start_date`,
  `end_date` (формат `yyyy-MM-dd`) и `files`; диалог закрывается с результатом
  обработчика.
- Ошибка загрузки отображается в диалоге, диалог остаётся открытым.
- Отмена закрывает диалог без результата загрузки.

## Clarity CSS

Компоненты на Clarity (`PaymentsFileButtons`, `RemainingDialog`, `Header`,
`LeftNavBar`) требуют подключённых стилей Clarity в приложении-потребителе
(стандартное подключение `@clr/angular` и `@clr/ui/clr-ui.min.css`), плюс
`@sotbi/ui/styles.css`.

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
- Иконка `angle` в триггере меню должна быть зарегистрирована потребителем:

```ts
import { ClarityIcons, angleIcon } from '@clr/angular/icon';

ClarityIcons.addIcons(angleIcon);
```

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
- Имена иконок из `icon` должны быть зарегистрированы приложением:

```ts
import { ClarityIcons, userIcon } from '@clr/angular/icon';

ClarityIcons.addIcons(userIcon);
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

## SimpleEditComponent

Таблица простого редактирования списков-разделов. Селектор: `simple-edit`.

### Inputs и outputs

- `items: SimpleEditModel[]` — редактируемые записи `{ id, name }`.
- `allowedToDelete: boolean` — показывает колонку удаления.
- `action: SimpleEditModel` — создание (`id: 0`) или сохранение строки
  с непустым именем.
- `delete: number` — идентификатор удаляемой строки.

Иконки `pencil`, `floppy`, `trash` должны быть зарегистрированы потребителем
через `ClarityIcons.addIcons`.

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
