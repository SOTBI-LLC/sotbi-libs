import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-request-status',
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
  color: string;
  name: string;

  agInit(params) {
    this.name = params.name ?? 'Черновик';
    this.color = params.color ?? '#000000';
  }

  refresh(): boolean {
    return false;
  }
}
