import type { OnDestroy } from '@angular/core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CostReal } from '@sotbi/models';
import { calcSumHours } from '@sotbi/models';
import { formatEventDuraton } from '@sotbi/utils';
import type { IStatusPanelAngularComp } from 'ag-grid-angular';
import type { GridApi, IRowNode, IStatusPanelParams } from 'ag-grid-community';

@Component({
  template: `
    <div class="ag-name-value">
      <span>Всего {{ text }}&nbsp;:&nbsp;</span>
      <span class="ag-name-value-value">{{ count }}</span>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AggregationStatusBarComponent implements OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  protected count = 0;
  protected text = '';
  private api: GridApi | null = null;

  public agInit({ api, text }): void {
    this.api = api;
    this.text = text;
    api.addEventListener('modelUpdated', this.modelUpdated.bind(this));
  }

  private modelUpdated() {
    this.count = this.api?.getDisplayedRowCount() ?? 0;
    this.cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this.api?.removeEventListener('modelUpdated', this.modelUpdated.bind(this));
  }
}

@Component({
  template: `
    @if (editable) {
      <div class="ag-name-value p-0">
        <button
          type="button"
          class="btn btn-sm"
          (click)="inputClicked(ctrl.value)"
        >
          Добавить</button
        >&nbsp;строки&nbsp;внизу:&nbsp;
        <span class="ag-name-value-value">
          <input
            class="clr-input"
            type="number"
            id="count"
            #ctrl="ngModel"
            [(ngModel)]="count"
            name="count"
            min="1"
            max="999"
            style="width: 1.5rem;"
          />
        </span>
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class AddRowsStatusBarComponent implements IStatusPanelAngularComp {
  protected editable = true;

  private params: IStatusPanelParams | null = null;
  protected count = 10;

  public agInit(params: IStatusPanelParams): void {
    this.params = params;
    this.editable = params['editable'];
  }

  protected inputClicked(count = 1) {
    if (!!this.params?.['onAdd'] && count && count > 0) {
      return this.params?.['onAdd'](count);
    }
  }
}

@Component({
  template: `
    <div class="ag-name-value" style="padding-top: .4rem;">
      <span>Заполнено часов&nbsp;:&nbsp;</span>
      <span class="ag-name-value-value">{{ hours }}</span>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SumHourStatusBarComponent
  implements IStatusPanelAngularComp, OnDestroy
{
  private readonly cdr = inject(ChangeDetectorRef);

  protected hours = '';
  private api: GridApi | null = null;

  public agInit({ api }: IStatusPanelParams): void {
    this.api = api;
    api.addEventListener('modelUpdated', this.modelUpdated.bind(this));
  }

  private modelUpdated() {
    const costs: CostReal[] = [];
    this.api?.forEachNodeAfterFilterAndSort(({ data }: IRowNode<CostReal>) => {
      if (data) {
        costs.push(data);
      }
    });
    this.hours = formatEventDuraton(calcSumHours(costs));
    this.cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this.api?.removeEventListener('modelUpdated', this.modelUpdated.bind(this));
  }
}
