import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AttachmentHistory } from '@sotbi/models';
import { Observable } from 'rxjs';
import { DD_MM_YYYY, DD_MM_YYYY_HH_MM_SS } from '@sotbi/utils';

export interface DialogHistoryDataModel {
  title: string;
  info: number;
  loadHistory: (id: number) => Observable<AttachmentHistory[]>;
  /** Словарь подписей полей истории; неизвестное поле отображается исходным ключом. */
  fieldLabels?: Record<string, string>;
}

@Component({
  selector: 'app-dialog-history',
  imports: [MatDialogModule],
  templateUrl: './dialog-history.component.html',
  styles: [
    `
      .fix-height-width {
        height: 309px;
        width: 100%;
      }
      .modal-box {
        min-height: 770px;
        overflow: hidden;
        .overflow {
          display: block;
          overflow: auto;
          .vh-75 {
            height: 75vh;
          }
        }
        .flex {
          display: flex;
          .grid {
            display: grid;
            min-width: fit-content;
            width: 34%;
          }
        }
      }

      tr th:last-child {
        display: none !important;
      }
      .table th.left:first-child {
        padding: 0.4583333333rem 0.5rem;
      }
    `,
  ],
})
export class DialogHistoryComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);

  inputData = inject<DialogHistoryDataModel>(MAT_DIALOG_DATA);
  dialogRef = inject<MatDialogRef<DialogHistoryComponent>>(MatDialogRef);

  keysOld!: string[];
  valuesOld!: string[];
  keys!: string[];
  // to do: добавить типизацию, мб переписать
  values!: unknown[];
  valuesNew!: unknown[];
  hideModal!: boolean;
  creatorId!: number;

  public ngOnInit(): void {
    this.hideModal = true;
    const id = this.inputData.info;
    const fieldLabels = this.inputData.fieldLabels ?? {};
    this.inputData
      .loadHistory(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows) => {
        const res = rows as unknown as Array<Record<string, unknown>>;
        this.changeDetector.markForCheck();
        if (res.length > 1) {
          this.hideModal = false;
          for (let i = 0; i < res.length - 1; i++) {
            // сравниваем новый объект с предыдущим
            const diff = Object.keys(res[i + 1]).reduce((differ, key) => {
              if (res[i][key] === res[i + 1][key]) {
                return differ;
              }
              if (res[i][key] === 'update' || res[i][key] === 'insert') {
                return differ;
              }
              if (typeof res[i][key] === 'object' && typeof res[i + 1][key] === 'object') {
                return differ;
              }
              return {
                ...differ,
                [key]: res[i][key],
              };
            }, {});

            const diffNew = Object.keys(res[i + 1]).reduce((differ, key) => {
              if (res[i][key] === res[i + 1][key]) {
                return differ;
              }
              if (res[i][key] === 'update' || res[i][key] === 'insert') {
                return differ;
              }
              if (typeof res[i][key] === 'object' && typeof res[i + 1][key] === 'object') {
                return differ;
              }
              return {
                ...differ,
                [key]: res[i + 1][key],
              };
            }, {});

            const dateUpdate = res[i + 1]['updated_at'] as Date;
            // заполняем колонку Информация
            this.keys = Object.keys(diff)
              .map((item) => {
                const array = Object.keys(fieldLabels);
                const values = Object.values(fieldLabels);
                for (let k = 0; k < array.length; k++) {
                  if (item.match(`${array[k]}`)) {
                    item = values[k];
                    return item;
                  }
                  continue;
                }
                return item;
              })
              .concat(this.keys)
              .join()
              .replace(
                /revision/gi,
                `➦ ${res[i]['revision'] as number}. ${formatDate(
                  dateUpdate!,
                  DD_MM_YYYY,
                  'ru-RU',
                )} обновил ${(res[i + 1]['updated_by'] as number) || '—'}:`,
              )
              .split(',');

            // заполняем колонку Было
            this.values = Object.values(diff)
              .map((item) => {
                if (typeof item === 'boolean') {
                  return item === true ? 'да' : 'нет';
                }
                if (
                  typeof item === 'string' &&
                  item.match(/\d{4}-\d{2}-\d{2}T/gi) &&
                  formatDate(dateUpdate!, DD_MM_YYYY_HH_MM_SS, 'ru-RU').substr(0, 10) ===
                    formatDate(item, DD_MM_YYYY_HH_MM_SS, 'ru-RU').substr(0, 10)
                ) {
                  return formatDate(item, DD_MM_YYYY_HH_MM_SS, 'ru-RU').substr(10);
                }
                if (
                  typeof item === 'string' &&
                  item.match(/\d{4}-\d{2}-\d{2}T/gi) &&
                  formatDate(dateUpdate!, DD_MM_YYYY_HH_MM_SS, 'ru-RU').substr(0, 10) !==
                    formatDate(item, DD_MM_YYYY_HH_MM_SS, 'ru-RU').substr(0, 10)
                ) {
                  return formatDate(item, DD_MM_YYYY_HH_MM_SS, 'ru-RU');
                } else {
                  return item;
                }
              })
              .concat(this.values)
              .fill('-', 0, 1);

            // заполняем колонку Стало
            this.valuesNew = Object.values(diffNew)
              .map((item) => {
                if (typeof item === 'boolean') {
                  return item === true ? 'да' : 'нет';
                }
                if (typeof item === 'object') {
                  /*      const item = new Object();
                item.name = ''; */
                  const tradingCode = Object.values(item as Record<string, unknown>)[1];
                  return tradingCode;
                }
                if (
                  typeof item === 'string' &&
                  item.match(/\d{4}-\d{2}-\d{2}T/gi) &&
                  !item.match(/00:00:00/gi)
                ) {
                  return formatDate(item, DD_MM_YYYY_HH_MM_SS, 'ru-RU').substr(10);
                }
                if (typeof item === 'string' && item.match(/00:00:00/gi)) {
                  return formatDate(item, DD_MM_YYYY_HH_MM_SS, 'ru-RU');
                } else {
                  return item;
                }
              })
              .concat(this.valuesNew)
              .fill('-', 0, 1);

            if (res.length > 2) {
              continue;
            }
            return;
          }
        }
      });
  }
}
