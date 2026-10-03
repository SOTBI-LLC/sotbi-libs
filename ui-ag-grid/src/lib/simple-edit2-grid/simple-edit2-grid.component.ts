import { ChangeDetectionStrategy, Component, Input, input, output, viewChild } from '@angular/core';
import { emptySimpleEdit, SimpleEdit2Model } from '@sotbi/models';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridEvent, ColDef, GridOptions, RowNode, RowSelectionOptions } from 'ag-grid-community';

import { ButtonActionsComponent } from '../button-actions.component';
import { localeText } from '../ag-grid.common';

@Component({
  selector: 'simple-edit2-grid',
  template: `
    <ag-grid-angular
      #agGrid
      style="width:100%;"
      [style.height]="height"
      class="ag-theme-balham"
      [rowData]="items"
      [gridOptions]="gridOptions"
    />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
})
export class SimpleEdit2GridComponent {
  private readonly agGrid = viewChild<AgGridAngular>('agGrid');
  @Input() public items: SimpleEdit2Model[] = [];
  public readonly caption = input('Тип');
  public readonly captionForName = input('Наименование');
  public readonly allowedToDelete = input(false);
  public readonly heightNumber = input(150);
  public readonly hiddenColumn = input(false);
  public readonly hiddenStatusColumn = input(true);
  public readonly floatingEditable = input(false);
  public readonly doubleClickEdit = input(false);
  protected readonly height = `calc(100vh - ${this.heightNumber()}px)`;
  public readonly action = output<SimpleEdit2Model>();
  public readonly delete = output<number>();
  public readonly selectedId = output<number>();

  private _disabled = 0;

  get disabled() {
    return this._disabled;
  }

  @Input()
  set disabled(disabled: number) {
    this._disabled = disabled;
  }

  get gridOptions(): GridOptions<SimpleEdit2Model> {
    return {
      rowSelection: {
        mode: 'singleRow',
        checkboxes: false,
        enableClickSelection: true,
      } as RowSelectionOptions,
      singleClickEdit: this.doubleClickEdit() ? false : true,
      stopEditingWhenCellsLoseFocus: true,
      tooltipShowDelay: 100,
      animateRows: true,
      overlayLoadingTemplate: '<span class="spinner"></span>',
      localeText,
      defaultColDef: {
        editable: () => {
          return this.floatingEditable() ? !!this.disabled : true;
        },
        resizable: true,
        sortable: true,
        filter: true,
        enablePivot: false,
        enableRowGroup: false,
        enableValue: false,
        menuTabs: [],
        hide: false,
      },
      onFirstDataRendered: (params) => params.api.sizeColumnsToFit(),
      components: {
        actionButtons: ButtonActionsComponent,
      },
      onSelectionChanged: (event) => this.onRowSelectionChanged(event),
      onCellValueChanged: ({ oldValue, newValue, api }) => {
        if (oldValue !== newValue) {
          api.refreshCells({ columns: ['actions'], force: true });
        }
      },
      columnDefs: this.columnDefs,
    };
  }

  private get columnDefs(): ColDef<SimpleEdit2Model>[] {
    return [
      {
        headerName: '№ п.п.',
        field: 'count',
        editable: false,
        width: 70,
        minWidth: 60,
        maxWidth: 75,
        valueGetter: ({ node }) => +(node?.id ?? 0) + 1,
        pinned: 'left',
        // hide: this.hiddenColumn,
      },
      {
        headerName: this.captionForName(),
        field: 'name',
      },
      {
        headerName: this.caption(),
        field: 'kind',
        resizable: false,
        sortable: false,
        filter: false,
        maxWidth: 100,
        minWidth: 60,
        width: 60,
        cellEditor: 'agCheckboxCellEditor',
        cellRenderer: 'agCheckboxCellRenderer',
        hide: this.hiddenColumn(),
      },
      {
        headerName: 'Показывать',
        field: 'deleted_at',
        colId: 'deleted_at',
        cellRenderer: 'agCheckboxCellRenderer',
        editable: false,
        valueGetter: (params) => !params.data?.deleted_at,
        hide: this.hiddenStatusColumn(),
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
        cellRendererParams: (param) => {
          const dataRow: SimpleEdit2Model = param.data;
          // если запись уже удалена, убираем возможность сохранить и удалить
          if (dataRow.deleted_at) {
            return [];
          }
          const params = {
            onSave: (row: RowNode) => this.onSaveClick(row),
            requiredFields: ['name'],
          };
          if (this.allowedToDelete()) {
            params['onDelete'] = (row: RowNode) => this.onDeleteClick(row);
          }
          return params;
        },
      },
    ] as ColDef<SimpleEdit2Model>[];
  }

  onSaveClick(row: RowNode) {
    const item = row.data as SimpleEdit2Model;
    this.action.emit(item);
  }
  onDeleteClick(row: RowNode) {
    const item = row.data as SimpleEdit2Model;
    if (item.id) {
      this.delete.emit(item.id);
    } else {
      this.items = this.items.filter((element) => !!element.id);
      this.items = [...this.items, Object.assign({}, emptySimpleEdit) as SimpleEdit2Model];
    }
  }

  onRowSelectionChanged({ api }: AgGridEvent) {
    const selectedRow = api.getSelectedRows()[0];
    if (selectedRow) {
      this.selectedId.emit(selectedRow.id);
    }
  }

  changeRowData(array: SimpleEdit2Model[]) {
    this.agGrid()?.api.setGridOption('rowData', array);
  }

  setFirstRowSelected() {
    this.agGrid()?.api?.getRowNode('0')?.setSelected(true);
  }
}
