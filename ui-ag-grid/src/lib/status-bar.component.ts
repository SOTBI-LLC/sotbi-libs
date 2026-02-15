import type { OnDestroy } from '@angular/core';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import type { CostReal } from '@sotbi/models';
import { calcSumHours } from '@sotbi/models';
import { CalendarState } from '@store/calendar.state';
import type { IStatusPanelAngularComp } from 'ag-grid-angular';
import type { GridApi, IStatusPanelParams, RowNode } from 'ag-grid-community';
import { formatEventDuraton } from '../date-func';

@Component({
  template: `
    <div class="ag-name-value">
      <span>Всего {{ text }}&nbsp;:&nbsp;</span>
      <span class="ag-name-value-value">{{ count }}</span>
    </div>
  `,
  styles: [],
  standalone: true,
})
export class AggregationStatusBarComponent implements OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  count = 0;
  text: string;
  private api: GridApi;

  agInit({ api, text }): void {
    this.api = api;
    this.text = text;
    api.addEventListener('modelUpdated', this.modelUpdated.bind(this));
  }

  modelUpdated() {
    this.count = this.api.getDisplayedRowCount();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.api.removeEventListener('modelUpdated', this.modelUpdated.bind(this));
  }
}

@Component({
  template: `
    @if (editable()) {
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
  imports: [FormsModule],
})
export class AddRowsStatusBarComponent implements IStatusPanelAngularComp {
  private readonly store = inject(Store);

  protected readonly editable = this.store.selectSignal(CalendarState.editable);

  private params: IStatusPanelParams;
  count = 10;

  agInit(params: IStatusPanelParams): void {
    this.params = params;
  }

  inputClicked(count = 1) {
    if (!!this.params['onAdd'] && count && count > 0) {
      return this.params['onAdd'](count);
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
  standalone: true,
})
export class SumHourStatusBarComponent
  implements IStatusPanelAngularComp, OnDestroy
{
  private readonly cdr = inject(ChangeDetectorRef);

  hours: string;
  private api: GridApi;

  agInit({ api }: IStatusPanelParams): void {
    this.api = api;
    api.addEventListener('modelUpdated', this.modelUpdated.bind(this));
  }

  modelUpdated() {
    const costs: CostReal[] = [];
    this.api.forEachNodeAfterFilterAndSort((row: RowNode) => {
      costs.push(row.data);
    });
    this.hours = formatEventDuraton(calcSumHours(costs));
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.api.removeEventListener('modelUpdated', this.modelUpdated.bind(this));
  }
}
