import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgOptionTemplateDirective,
  NgSelectComponent,
} from '@ng-select/ng-select';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';

@Component({
  template: `
    <ng-select
      class="ng-select"
      [clearable]="clearable"
      name="ngSelect"
      id="ngSelect"
      #ngSelect="ngModel"
      [items]="values"
      [bindLabel]="bindName"
      [bindValue]="bindId"
      [(ngModel)]="value"
      notFoundText="Не найдено"
      appendTo="body"
      [searchFn]="customSearchFn"
    >
      <ng-template ng-option-tmp let-item="item">
        <span
          [ngStyle]="
            (item.name === item.project_name && {
              background: 'rgba(0,0,0,0.1',
              display: 'flex',
              padding: '0 0 0 16px',
              margin: '0 -16px',
            }) || { padding: '0 0 0 32px' }
          "
          >{{ item.name }}&nbsp;</span
        >
        @if (item.name !== item.project_name && item.project_name) {
          <span style="color: grey">({{ item.project_name }})</span>
        }
      </ng-template>
    </ng-select>
  `,
  styles: [
    `
      ::ng-deep
        ng-dropdown-panel.ng-dropdown-panel
        .ng-dropdown-panel-items
        div.ng-option {
        white-space: pre;
        cursor: pointer;
      }
      ::ng-deep .ng-dropdown-panel.ng-select-bottom {
        width: 20% !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgSelectComponent, FormsModule, NgOptionTemplateDirective, NgStyle],
})
export class ProjectAndDebtorSelectEditor<T> implements ICellEditorAngularComp {
  protected values: T[] = [];
  protected value = 0;
  protected bindId = 'id';
  protected bindName = 'name';
  protected clearable = false;

  public agInit(params: ICellEditorParams): void {
    this.values = params['values'];
    this.bindId = params['bindId'] ?? 'id';
    this.bindName = params['bindName'] ?? 'name';
    this.clearable = params['clearable'] ?? false;
    this.value = params.value;
  }

  protected customSearchFn(
    term: string,
    item: { name: string; project_name: string },
  ) {
    term = term.toLowerCase();
    return (
      item.name.toLowerCase().indexOf(term) > -1 ||
      item.project_name?.toLowerCase().indexOf(term) > -1
    );
  }

  public getValue(): number {
    return this.value;
  }
}
