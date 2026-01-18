import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { ICellEditorParams } from 'ag-grid-community';

@Component({
  template: ` <input type="color" [(ngModel)]="value" style="width:100%" /> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class ColorEditorComponent implements ICellEditorAngularComp {
  protected value = '';

  public agInit(params: ICellEditorParams): void {
    this.value = params.value ?? null;
  }

  public isPopup(): boolean {
    return false;
  }

  public getValue(): string | null {
    return this.value;
  }
}
