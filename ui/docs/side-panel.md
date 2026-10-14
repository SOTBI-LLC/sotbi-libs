# Side Panel

`SidePanelService`, `SidePanelFrameComponent`, `SidePanelRef` и `SIDE_PANEL_DATA` экспортируются из `@sotbi/ui`. Для Clarity нужны стили `@clr/ui`, `@sotbi/ui/styles.css` и Angular-провайдер анимаций приложения.

## Программное открытие

```ts
const panel = panelService.open<EditProjectComponent, Project, Project>(
  EditProjectComponent,
  { data: project, size: 'lg' },
);
panel.closed.subscribe((outcome) => {
  if (outcome.kind === 'success') refreshProject(outcome.value);
});
```

Содержимое получает `SIDE_PANEL_DATA` и `SidePanelRef` через DI. Оно задаёт состояние формы:

```ts
panelRef.setState({
  dirty: () => form.dirty,
  blocked: () => saving(),
});
```

Все пользовательские способы отмены вызывают `panelRef.requestClose()`. Подтверждённый успех операции вызывает `panelRef.complete(result)`. Даже `complete(undefined)` является успехом и отличается от отмены в `closed`. `afterClosed()` предназначен для прежних обработчиков результата: при отмене он выдаёт `undefined`.

Обработчик сохранения проверяет блокировку перед отправкой запроса. Во время запроса он выставляет состояние выполнения; при определённой ошибке снимает блокировку, сохраняет ввод и отображает ошибку. При неизвестном результате команды потребитель сохраняет дополнительную блокировку и идентичность команды согласно своему контракту.

## Оболочка содержимого

```html
<sotbi-side-panel>
  <h3 panelTitle>Изменить проект</h3>
  <div panelBody><!-- форма и сообщения ошибок --></div>
  <div panelActions>
    <button type="button" (click)="panelRef.requestClose()">Отмена</button>
    <button type="button" (click)="save()" [disabled]="saving()">
      Сохранить
    </button>
  </div>
</sotbi-side-panel>
```

`panelTitle`, `panelBody` и `panelActions` — атрибуты слотов проекции. Содержимое действий располагается отдельно от прокручиваемой формы. Размеры: `sm`, `md`, `lg`, `xl`, `full-screen`. На узком экране панель занимает всю доступную ширину.

Для декларативной панели передаются `[dirty]`, `[blocked]`, `[size]` и `(cancelled)`. Вызов `requestClose()` на template reference оболочки использует ту же политику, что Escape и крестик. При программном открытии состояние задаётся через переданный `SidePanelRef`.

Короткие подтверждения используют `presentation="modal"`. `DialogCanDeactivateComponent` сохраняет три решения существующих guards: сохранить, отказаться от изменений или продолжить редактирование. Внутреннее подтверждение закрытия панели предлагает остаться либо отказаться от изменений.

## Переход с Material Dialog

Вместо `MatDialog.open` используется `SidePanelService.open`, данные приходят через `SIDE_PANEL_DATA`. Ручные `mat-dialog-close` заменяются явной отменой или завершением операции. Параметры `width`, `maxWidth`, `panelClass`, `autoFocus`, `disableClose` заменяются размером и общими правилами взаимодействия; фон формы не закрывает её. Запросы, валидация, права и обновление данных остаются у потребителя.

Изменения диалоговых контрактов требуют согласованного обновления библиотеки и приложения. Для локальной проверки timetable использует собранный `file:../sotbi-libs/dist/ui`; перед выпуском подключается согласованная опубликованная версия библиотеки.
