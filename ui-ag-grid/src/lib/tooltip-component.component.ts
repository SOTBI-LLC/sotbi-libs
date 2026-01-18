import { Component } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';
import { ITooltipParams } from 'ag-grid-community';

@Component({
  selector: 'app-tooltip-component',
  template: `@if (show) {
    <div class="custom-tooltip">
      <span>По данному счёту есть выписки или заявки. Номер и БИК нельзя редактировать</span>
    </div>
  }`,
  styles: [
    `
      :host {
        position: absolute;
        width: fit-content;
        height: 3.5rem;
      }
      :host.ag-tooltip-hiding {
        opacity: 0;
      }
      .custom-tooltip {
        background-color: white;
        border: 1px solid black;
      }
      .custom-tooltip span {
        margin: 0.5rem;
      }
    `,
  ],
  standalone: true,
})
export class TooltipComponent implements ITooltipAngularComp {
  private params: ITooltipParams;
  protected show = false;

  agInit(params: ITooltipParams): void {
    this.params = params;
    if (
      this.params.data.account_statement_requests ||
      this.params.data.payment_request ||
      !!this.params.data.final_balance ||
      this.params.data.final_balance === 0
    ) {
      this.show = true;
    }
  }
}
