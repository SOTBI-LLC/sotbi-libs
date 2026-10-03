# @sotbi/ui-ag-grid

Компоненты AG Grid с прикладными данными и действиями через публичные
контракты: приложение передаёт функции поиска, проверки, загрузки и скачивания.
Зависимость направления `ui-ag-grid → ui`.

Зависимости (peerDependencies): Angular 22.x, AG Grid 34.3.x (community +
enterprise: таблицы используют SideBar/pivot), @clr/angular 18.3.x,
@ng-select, date-fns, angular-imask, @sotbi/models, @sotbi/utils, @sotbi/ui,
rxjs. Стили: `@sotbi/ui-ag-grid/styles.css`.

## Редактор номера (CheckNumEditor)

```ts
import { CheckNumEditor, CheckNumEditorParams } from '@sotbi/ui-ag-grid';

const colDef: ColDef = {
  field: 'request_num',
  cellEditor: CheckNumEditor,
  cellEditorParams: () =>
    ({ lookupNumber: (num) => this.srv.checkNum(num) }) satisfies Pick<
      CheckNumEditorParams,
      'lookupNumber'
    >,
};
```

`lookupNumber` получает введённое значение; при успешном ответе `getValue`
возвращает номер с ведущим пробелом (признак проверки для подсветки), при
ошибке — без окружающих пробелов.

## Фильтр и редактор кода торгов

```ts
import {
  SelectSearchTradingCodeEditor,
  TradingCodeEditorParams,
  TradingCodeFilterComponent,
  TradingCodeFilterParams,
} from '@sotbi/ui-ag-grid';
```

- `TradingCodeFilterComponent` (`filter`) и `SelectSearchTradingCodeEditor`
  (`cellEditor`) получают варианты через `searchTradingCodes(term)` из
  `cellEditorParams` / `filterParams`. Ошибка поиска отображается как «Не
  найдено» без падения; фильтр возвращает модель
  `{ values: string[], filterType: 'set' }`.

## Файловые компоненты

```ts
import {
  DropFileComponent,
  DropFileParams,
  FileTypeRendererComponent,
  FileTypeRendererParams,
  DownloadAllComponent,
  DownloadAllParams,
} from '@sotbi/ui-ag-grid';
```

- `DropFileComponent` — загрузка через `uploadFiles(FileList)` и скачивание
  через `downloadFile(attachment)`; результат загрузки возвращается
  `getValue()`.
- `FileTypeRendererComponent` — ссылка на файл с библиотечной иконкой (pdf /
  excel / txt, без sprite приложения); клик вызывает `downloadFile`.
- `DownloadAllComponent` — ссылка «Скачать все»; клик вызывает
  `downloadAll(rowId)`.
- Контракт скачивания — `DownloadFileDescriptor { file?; original_file_name? }`
  (структурно совместим с `DownloadFile` из `@sotbi/data-access`).

## Список недвижимости (RealEstateListComponent)

```ts
import { RealEstateForm, RealEstateListComponent } from '@sotbi/ui-ag-grid';
```

Принимает готовый `FormArray<FormGroup<RealEstateForm>>` (фабрики и валидаторы
остаются в приложении) и inputs `edit`, `showFile`, `lookupNumber`,
`uploadFiles`, `downloadFile`. Подсветка ячейки номера — при ведущем пробеле
или дубликате. Удаление изменяет переданный массив; событие
`delete: { idx, id }` отправляется только для строки с сохранённым `id`.

## Список сотрудников (EmployeesListComponent)

```ts
import { EmployeesListComponent } from '@sotbi/ui-ag-grid';
```

```html
<employees-list
  [employeesList]="fg()"
  [isEdit]="isEdit()"
  [users]="receivers()"
  [usersMap]="usersMap()"
  [lookupUserName]="lookupEmployeeUserName"
/>
```

Сохранены прежние inputs `employeesList`, `isEdit`, `users`, `usersMap` и
селектор `employees-list`. Новый `lookupUserName?: (id: number) =>
Observable<string>` необязателен: без него выбор пользователя сохраняет
переданное `user_name`; с ним — `user_id` и полное `user_name` синхронизируются
с переданной формой. Удаление поддерживает любую строку, включая первую; смена
контура сбрасывает связанные поля.

Редактор колонки «Пользователь» — `NgSelectEditor` (ng-select); `valueSetter`
принимает как числовой `id`, так и объект `UserShort` от прежнего rich-select,
нормализуя значение к идентификатору.

## Список страховых данных (InsuranceListComponent)

```ts
import { InsuranceListComponent, InsuranceLinkBuilder } from '@sotbi/ui-ag-grid';
```

```html
<insurance-list
  [insuranceList]="policies"
  [bankruptcies]="bankruptcies"
  [insuranceCompanies]="companies"
  [downloadAll]="downloadFiles"
  (openInsurance)="openRow($event)"
  [debtorLink]="myDebtorLink"
  [insuranceCompanyLink]="myCompanyLink"
/>
```

Отображает подписи из переданных справочников; настройки таблицы сохраняются с
префиксом `insurance-list` при `all: true`. Ссылки по умолчанию:
`/bankruptcy/debtors/<id>/common` и `/catalogs/insurance-companies/<id>`;
необязательные `debtorLink` / `insuranceCompanyLink` (`(id) => route commands`)
заменяют их.

## Таблица простого редактирования (SimpleEdit2GridComponent)

Обёртка ag-grid для списков `{ id, name, kind }`. Селектор:
`simple-edit2-grid`.

### Inputs

- `items: SimpleEdit2Model[]` — строки таблицы.
- `caption` (по умолчанию «Тип»), `captionForName` («Наименование») —
  заголовки колонок.
- `allowedToDelete` — добавляет кнопку удаления в строке.
- `heightNumber` — отступ высоты `calc(100vh - Npx)`; по умолчанию 150.
- `hiddenColumn` — скрывает колонку «Тип» (по умолчанию показана).
- `hiddenStatusColumn` — скрывает колонку «Показывать» (по умолчанию
  скрыта).
- `floatingEditable` — при включении редактирование только при
  установленном `disabled`.
- `doubleClickEdit` — редактирование по двойному клику вместо одиночного.
- `disabled: number` — признак режима «только просмотр» при
  `floatingEditable`.

### Outputs и публичные методы

- `action: SimpleEdit2Model` — сохранение строки (кнопка в колонке
  действий).
- `delete: number` — удаление сохранённой строки; несохранённая строка
  заменяется пустой локально.
- `selectedId: number` — идентификатор выбранной строки.
- `changeRowData(array)` — подмена данных грида без пересоздания.
- `setFirstRowSelected()` — выбор первой строки.
