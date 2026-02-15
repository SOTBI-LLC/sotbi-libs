import { Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  template: `@for (item of value; track item) {
    <span class="label">{{ item }}</span>
  }`,
})
export class LabelsAgGridComponent implements ICellRendererAngularComp {
  protected value: string[];

  public agInit(params: ICellRendererParams): void {
    this.value = params.value;
  }

  public refresh(): boolean {
    return false;
  }
}
