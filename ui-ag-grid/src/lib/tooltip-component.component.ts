import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { ITooltipAngularComp } from 'ag-grid-angular';
import type { ITooltipParams } from 'ag-grid-community';

@Component({
  template: `@if (show) {
    <div class="custom-tooltip">
      <span
        >По данному счёту есть выписки или заявки. Номер и БИК нельзя
        редактировать</span
      >
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TooltipComponent implements ITooltipAngularComp {
  private params: ITooltipParams | null = null;
  protected show = false;

  public agInit(params: ITooltipParams): void {
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
