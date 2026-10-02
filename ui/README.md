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

Компоненты на Clarity (`PaymentsFileButtons`, `RemainingDialog`) требуют
подключённых стилей Clarity в приложении-потребителе (стандартное подключение
`@clr/angular`).
