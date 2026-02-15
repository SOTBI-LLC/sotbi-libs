import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <div class="cycle" [style.background-color]="color"></div>
      <div class="text">{{ name }}</div>
    </div>
  `,
  styles: [
    `
      .wrap {
        display: flex;
        align-items: center;
      }
      .cycle {
        border-radius: 50%;
        min-width: 0.5rem;
        width: 0.5rem;
        height: 0.5rem;
        border: 1px solid #8080806b;
      }
      .text {
        margin-left: 10px;
      }
    `,
  ],
})
export class RequestStatusComponent implements ICellRendererAngularComp {
  protected color = '';
  protected name = '';

  public agInit(params) {
    this.name = params.name ?? 'Черновик';
    this.color = params.color ?? '#000000';
  }

  public refresh(): boolean {
    return false;
  }
}
