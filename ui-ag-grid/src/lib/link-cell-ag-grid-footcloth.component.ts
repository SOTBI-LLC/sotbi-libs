import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  template:
    '<a class="footcloth-link-cell-ag-grid__link" [routerLink]="routerLink"> {{name}} </a>',
  styles: [
    `
      .footcloth-link-cell-ag-grid__link:link {
        color: #0079b8;
      }
      .footcloth-link-cell-ag-grid__link:visited {
        color: #0079b8;
      }
      .footcloth-link-cell-ag-grid__link:hover {
        text-decoration: underline;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class LinkCellAgGridFootclothComponent implements ICellRendererAngularComp {
  protected routerLink: string[] = [];
  protected name = '';

  public refresh(): boolean {
    return false;
  }

  public agInit(params: ICellRendererParams) {
    const { data } = params;
    const field = params.colDef?.field ?? 'debtor_name';
    this.name = data[field];
    if (Object.entries(data)) {
      switch (field) {
        case 'bidding_name': {
          this.routerLink = [
            '../',
            data.initiator_id,
            'debtor',
            data.debtor_id,
            'bidding',
            data.bidding_id,
          ];
          break;
        }
        case 'debtor_name': {
          this.routerLink = ['/debtors/', data.debtor_id];
          break;
        }
        case 'initiator_name': {
          this.routerLink = ['../', data.initiator_id];
          break;
        }
      }
    }
  }
}
