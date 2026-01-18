import type { AfterViewInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrCheckboxModule, ClrCommonFormsModule } from '@clr/angular';
import type { AgFilterComponent } from 'ag-grid-angular';
import type {
  FilterModel,
  IDoesFilterPassParams,
  IFilterParams,
  NumberFilterModel,
} from 'ag-grid-community';
import { AgGridFilterType, AgGridFilterTypeOperation } from './ag-grid.common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <input
        type="checkbox"
        #checkbox
        [(ngModel)]="checked"
        (change)="toggleCheckbox()"
        class="checkbox"
        clrCheckbox
        id="checkbox"
      />
      <label class="mt-1" for="checkbox"
        >Показывать только {{ params.colDef.headerName }} платежи
      </label>
    </div>
  `,
  styles: [
    `
      .container {
        display: flex;
        justify-content: left;
        margin-left: 6%;
      }
      .checkbox {
        width: 16px;
      }
      .mt-1 {
        margin-top: 1%;
      }
    `,
  ],
  imports: [FormsModule, ClrCheckboxModule, ClrCommonFormsModule],
})
export class CheckboxFilterComponent
  implements AgFilterComponent, AfterViewInit
{
  protected params!: IFilterParams;

  protected readonly checkbox = viewChild('checkbox', {
    read: ViewContainerRef,
  });

  protected checked = false;

  public agInit(params: IFilterParams): void {
    this.params = params;
  }

  public getModel(): NumberFilterModel | null {
    if (this.checked) {
      return {
        filterType: AgGridFilterType.NUMBER,
        type: AgGridFilterTypeOperation.GREATER_THAN,
        filter: 0,
        filterTo: null,
      };
    }
    return null;
  }

  public setModel(model: FilterModel): void {
    this.checked = model ? model.value : false;
  }

  public isFilterActive(): boolean {
    return this.checked /* !== null && this.checked !== undefined*/;
  }

  public doesFilterPass(params: IDoesFilterPassParams): boolean {
    console.log('CheckboxFilterComponent::doesFilterPass', params);
    return true;
  }

  public toggleCheckbox(): void {
    this.params.filterChangedCallback();
  }

  public ngAfterViewInit(): void {
    window.setTimeout(() => {
      this.checkbox()?.element.nativeElement.focus();
    });
  }
}
