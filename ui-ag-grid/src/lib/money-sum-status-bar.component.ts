import { formatCurrency } from '@angular/common';
import type { OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { IStatusPanelAngularComp } from 'ag-grid-angular';
import type { GridApi, IRowNode, IStatusPanelParams } from 'ag-grid-community';

/** Параметры panel, передаваемые через `statusPanelParams`. */
export interface MoneySumStatusPanelParams<T = unknown> {
  /** Подпись перед суммой, например «ИТОГО». */
  label: string;
  /** Правило суммирования потребителя; получает данные отображаемых строк. */
  sum: (rows: T[]) => number;
  /** Формат цифр Angular (`digitsInfo`); по умолчанию — точность рубля. */
  digitsInfo?: string;
  /** Раскрашивать значение по знаку. */
  colorBySign?: boolean;
}

type Sign = 'positive' | 'negative' | 'zero';

/** Локаль суммы; приложение регистрирует данные локали `ru` (`registerLocaleData(localeRu, 'ru')`). */
const LOCALE = 'ru';

@Component({
  template: `
    <div class="ag-name-value">
      <span>{{ label() }}:&nbsp;</span>
      <span
        class="ag-name-value-value"
        [class.money-sum--positive]="sign() === 'positive'"
        [class.money-sum--negative]="sign() === 'negative'"
        [class.money-sum--zero]="sign() === 'zero'"
        >{{ formatted() }}</span
      >
    </div>
  `,
  styles: `
    .money-sum--positive {
      color: green;
    }
    .money-sum--negative {
      color: red;
    }
    .money-sum--zero {
      color: inherit;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoneySumStatusBarComponent<T = unknown>
  implements IStatusPanelAngularComp, OnDestroy
{
  protected readonly label = signal('');
  protected readonly formatted = signal('');
  protected readonly sign = signal<Sign | null>(null);

  private api: GridApi<T> | null = null;
  private params: MoneySumStatusPanelParams<T> | null = null;
  private readonly onModelUpdated = (): void => this.recalculate();

  public agInit(
    params: IStatusPanelParams<T> & MoneySumStatusPanelParams<T>,
  ): void {
    this.params = params;
    this.api = params.api;
    this.label.set(params.label);
    this.api.addEventListener('modelUpdated', this.onModelUpdated);
    this.recalculate();
  }

  public ngOnDestroy(): void {
    if (this.api && !this.api.isDestroyed()) {
      this.api.removeEventListener('modelUpdated', this.onModelUpdated);
    }
    this.api = null;
  }

  private recalculate(): void {
    if (!this.api || !this.params) {
      return;
    }
    const rows: T[] = [];
    this.api.forEachNodeAfterFilterAndSort(({ data }: IRowNode<T>) => {
      if (data) {
        rows.push(data);
      }
    });
    const value = this.params.sum(rows);
    this.formatted.set(
      formatCurrency(value, LOCALE, '', 'RUB', this.params.digitsInfo),
    );
    this.sign.set(this.params.colorBySign ? signOf(value) : null);
  }
}

function signOf(value: number): Sign {
  if (value > 0) {
    return 'positive';
  }
  return value < 0 ? 'negative' : 'zero';
}
