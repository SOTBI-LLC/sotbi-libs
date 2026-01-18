import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClrCheckboxModule } from '@clr/angular';
import type { Access } from '@sotbi/models';
import type {
  ICellEditorAngularComp,
  ICellRendererAngularComp,
} from 'ag-grid-angular';
import type { ICellEditorParams, ICellRendererParams } from 'ag-grid-community';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="checkbox"
      clrCheckbox
      [checked]="checked"
      (change)="onChange($event.target.checked)"
    />
  `,
  styles: [],
  imports: [ClrCheckboxModule],
})
export class AgCheckboxComponent
  implements ICellEditorAngularComp, ICellRendererAngularComp
{
  private params:
    | ICellEditorParams<Access>
    | ICellRendererParams<Access>
    | null = null;
  private field = 'mask';
  private curMask = 0;
  protected checked = false;

  public agInit(
    params: ICellEditorParams<Access> | ICellRendererParams<Access>
  ): void {
    this.params = params;
    if (params['field']) {
      this.field = params['field'];
    }
    this.curMask = +(params.colDef?.colId ?? 0);
    // tslint:disable-next-line: no-bitwise
    this.checked = !!(this.curMask & (this.params.data?.[this.field] ?? 0));
  }

  public refresh(
    params: ICellEditorParams<Access> | ICellRendererParams<Access>
  ) {
    this.params = params;
    // tslint:disable-next-line: no-bitwise
    this.checked = !!(this.curMask & (this.params.data?.[this.field] ?? 0));
    return true;
  }

  public getValue(): boolean {
    return this.checked;
  }

  protected onChange(event: boolean) {
    this.checked = event;
    let val = this.params?.data?.[this.field] ?? 0;
    // tslint:disable-next-line: no-bitwise
    if (this.checked) {
      val = val | this.curMask;
    } else {
      val = val & ~this.curMask;
    }
    this.params?.node.setDataValue(this.field, val);
    this.params?.api.stopEditing();
  }
}
