import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

interface ICustomButtonParams {
  onClick: (dataId?: string, nodeId?: number) => void;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 36 36"
      aria-hidden="true"
      class="is-error"
      style="cursor: pointer"
      (click)="onClick()"
    >
      <path
        fill="currentColor"
        d="M27.98 31C28 31.25 27.92 31.49 27.76 31.68C27.6 31.87 27.37 31.98 27.12 32H8.85C8.6 31.98 8.37 31.87 8.21 31.68C8.05 31.49 7.97 31.25 7.99 31V11.03H5.97V31C5.95 31.78 6.24 32.53 6.78 33.09C7.32 33.65 8.06 33.98 8.85 34H27.12C27.9 33.98 28.65 33.66 29.19 33.09C29.73 32.52 30.02 31.77 30 31V11.03H27.98V31ZM13 12.98V27.98H15.02V12.98H13ZM15 4H21V6H23V4C23 2.9 22.1 2 21 2H15C13.9 2 13 2.9 13 4V6H15V4ZM30.99 6.98H5.01C4.45 6.98 4 7.43 4 7.98C4 8.53 4.45 8.98 5.01 8.98H30.99C31.55 8.98 32 8.53 32 7.98C32 7.43 31.55 6.98 30.99 6.98ZM20.98 12.98V27.98H23V12.98H20.98Z"
      />
    </svg>
  `,
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
