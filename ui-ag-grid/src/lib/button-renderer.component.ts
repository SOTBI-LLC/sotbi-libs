import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClrIconModule } from '@clr/angular';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cds-icon
      shape="trash"
      class="is-error"
      style="cursor: pointer"
      (click)="onClick()"
    />
  `,
  imports: [ClrIconModule],
})
export class ButtonRendererComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams;

  public agInit(params: ICellRendererParams): void {
    this.params = params;
  }
  public refresh(): boolean {
    return false;
  }

  protected onClick() {
    return this.params['onClick'](
      this.params.node.data.id,
      +(this.params.node.id ?? 0)
    );
  }
}
