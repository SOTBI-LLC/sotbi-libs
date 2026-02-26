import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { PostAddress } from '@sotbi/models';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  ColDef,
  GridOptions,
  ICellRendererParams,
  RowNode,
} from 'ag-grid-community';
import { localeText } from './ag-grid.common';
import { ButtonActionsComponent } from './button-actions.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-post-addres-grid',
  template: `
    <ag-grid-angular
      #agGrid
      style="width:100%;"
      class="ag-theme-balham"
      [rowData]="items()"
      [gridOptions]="gridOptions"
    />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
})
export class PostAddresGridComponent {
  public readonly items = input<PostAddress[]>([]);
  public readonly caption = input('Тип');
  public readonly captionForName = input('Наименование');

  public readonly action = output<PostAddress>();
  public readonly delete = output<number | PostAddress>();

  protected get gridOptions(): GridOptions {
    return {
      domLayout: 'autoHeight',
      singleClickEdit: true,
      stopEditingWhenCellsLoseFocus: true,
      tooltipShowDelay: 100,
      animateRows: true,
      overlayLoadingTemplate: '<span class="spinner"></span>',
      localeText,
      defaultColDef: {
        editable: true,
        resizable: true,
        sortable: true,
        filter: true,
        enablePivot: false,
        enableRowGroup: false,
        enableValue: false,
        menuTabs: [],
        hide: false,
        cellStyle: ({ data }) => {
          const style: Record<string, string> = {};
          if (data.deleted_at) {
            style['textDecoration'] = 'line-through';
          }
          return style;
        },
      },
      onFirstDataRendered: (params) => params.api.sizeColumnsToFit(),
      components: {
        actionButtons: ButtonActionsComponent,
      },
      onCellValueChanged: ({ oldValue, newValue, api, rowIndex }) => {
        if (typeof newValue === 'boolean') {
          this.items()?.forEach((item, index) => {
            if (index !== rowIndex) {
              item.default = false;
            }
          });
          api.refreshCells({ columns: ['default'], force: true });
        }
        if (oldValue !== newValue) {
          api.refreshCells({ columns: ['actions'], force: true });
        }
      },
      columnDefs: this.columnDefs,
    } as GridOptions;
  }

  private get columnDefs(): ColDef[] {
    return [
      {
        headerName: this.captionForName(),
        field: 'name',
        width: 200,
      },
      {
        headerName: 'Описание',
        field: 'type',
        width: 100,
      },
      {
        headerName: 'Использовать по умолчанию',
        field: 'default',
        resizable: false,
        sortable: false,
        filter: false,
        width: 220,
        maxWidth: 220,
        cellEditor: 'agCheckboxCellEditor',
        cellRenderer: ({ value }: ICellRendererParams) => {
          let shape = 'circle';
          if (value) {
            shape = 'success-standard';
          }
          return `<cds-icon shape="${shape}" class="is-highlight"></cds-icon>`;
        },
      },
      {
        headerName: '⋮',
        colId: 'actions',
        maxWidth: 110,
        sortable: false,
        filter: false,
        suppressHeaderMenuButton: true,
        editable: false,
        cellRenderer: 'actionButtons',
        cellRendererParams: ({ api }: ICellRendererParams<PostAddress>) => {
          return {
            onSave: (row: RowNode) => this.onSaveClick(row),
            onDelete: (row: RowNode) => {
              this.onDeleteClick(row);
              api.refreshCells({ rowNodes: [row], force: true });
            },
            requiredFields: ['name'],
          };
        },
      },
    ] as ColDef[];
  }

  protected onSaveClick({ data }: RowNode): void {
    this.action.emit(data);
  }

  protected onDeleteClick({ id, data }: RowNode<PostAddress>): void {
    if (data?.id) {
      this.delete.emit(+(id ?? 0));
    }
  }
}
