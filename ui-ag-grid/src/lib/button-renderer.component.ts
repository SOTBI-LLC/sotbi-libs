import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClrIconModule } from '@clr/angular';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

interface ICustomButtonParams {
  onClick: (dataId?: string, nodeId?: number) => void;
}

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
  private params!: ICellRendererParams & ICustomButtonParams;

  public agInit(params: ICellRendererParams & ICustomButtonParams): void {
    this.params = params;
  }
  public refresh(): boolean {
    return false;
  }

  protected onClick() {
    return this.params.onClick(
      this.params.node.data.id,
      +(this.params.node.id ?? 0),
    );
  }
}
