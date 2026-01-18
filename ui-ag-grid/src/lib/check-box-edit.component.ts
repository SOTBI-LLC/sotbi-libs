import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClrCheckboxModule } from '@clr/angular';
import type { ICellEditorAngularComp } from 'ag-grid-angular';
import type { GridApi, ICellEditorParams } from 'ag-grid-community';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (editable || value) {
    <input
      #chkbx
      class="ag-chkbox-edit"
      style="width: 100%; height: 100%; padding: 2px 11px; line-height: 0; border: 0;"
      clrCheckbox
      type="checkbox"
      name="chkbx"
      (change)="onChange()"
      [(ngModel)]="value"
      [disabled]="!editable"
    />
    }
  `,
  styles: [``],
  imports: [FormsModule, ClrCheckboxModule],
})
export class CheckBoxEditComponent implements ICellEditorAngularComp {
  private api!: GridApi;
  protected value = false;
  protected editable = true;
  // @ViewChild('chkbx', { read: ViewContainerRef, static: false }) public input: any;
  private resolveEditable(params: ICellEditorParams): boolean {
    const editable = params.colDef?.editable;

    if (typeof editable === 'function') {
      return !!editable.call(params.context, params);
    }

    if (editable === undefined || editable === null) {
      return true;
    }

    return !!editable;
  }

  public refresh(params: ICellEditorParams): boolean {
    this.value = params.value;
    this.editable = this.resolveEditable(params);
    return true;
  }

  public agInit(params: ICellEditorParams) {
    this.value = params.value;
    this.api = params.api;
    this.editable = this.resolveEditable(params);
  }

  public getValue(): boolean {
    return this.value;
  }

  /**
   * onChange
   */
  protected onChange() {
    this.api.stopEditing();
  }
}
