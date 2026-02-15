import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { GridApi, IToolPanel, IToolPanelParams } from 'ag-grid-community';

@Component({
  template: `
    <div class="tool-panel">
      <div class="buttons-group  tool-panel__item">
        <button
          class="btn btn-sm btn-secondary  buttons-group__item"
          (click)="autosizeAllColumns()"
        >
          Автоширина всех колонок
        </button>
        <button
          class="btn btn-sm btn-secondary  buttons-group__item"
          (click)="resetColumns()"
        >
          Восстановить настройки по умолчанию для всех колонок
        </button>
        @if (showButtonResetFilterAndSort) {
          <button
            class="btn btn-sm btn-secondary  buttons-group__item"
            (click)="resetFilterAndSort()"
          >
            Сбросить фильтр и сортировку
          </button>
        }
      </div>
      <div class="buttons-group  tool-panel__item">
        <button
          class="btn btn-sm btn-secondary  buttons-group__item"
          (click)="exportExcel()"
        >
          Экспортировать в Excel только видимые столбцы
        </button>
        <button
          class="btn btn-sm btn-secondary  buttons-group__item"
          (click)="onBtExport()"
        >
          Экспортировать в Excel все столбцы
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        min-height: 400px;
        max-height: 100vh;
        padding: 10px;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
      }
      .tool-panel__item:not(:first-child) {
        margin-top: 40px;
        position: relative;
      }
      .tool-panel__item:not(:first-child):before {
        content: '';
        display: block;
        width: 100%;
        height: 1px;
        background-color: #bdc3c7;
        position: absolute;
        top: -20px;
        left: 0;
      }
      .buttons-group {
        display: flex;
        flex-direction: column;
      }
      .buttons-group__item:not(:first-child) {
        margin-top: 10px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class RightSideBarAgGridComponent implements IToolPanel {
  private gridApi: GridApi | null = null;
  protected showButtonResetFilterAndSort = true;

  public agInit(params: IToolPanelParams): void {
    this.gridApi = params.api;
  }

  public refresh(): boolean {
    return false;
  }

  protected autosizeAllColumns() {
    const allColumnIds: string[] = [];
    this.gridApi?.getColumns()?.forEach((column) => {
      allColumnIds.push(column.getColId());
    });
    this.gridApi?.autoSizeColumns(allColumnIds, true);
    this.gridApi?.closeToolPanel();
  }

  protected resetFilterAndSort() {
    const filter = this.gridApi?.getFilterModel();
    if (!Object.prototype.hasOwnProperty.call(filter, 'inn')) {
      this.gridApi?.setFilterModel(null);
    }
    this.gridApi?.applyColumnState({
      defaultState: { sort: null },
    });
    this.gridApi?.closeToolPanel();
  }

  protected resetColumns() {
    this.gridApi?.resetColumnState();
    this.gridApi?.closeToolPanel();
  }
  protected onBtExport(): void {
    const params = {
      columnGroups: true,
      onlyVisible: false,
      allColumns: true,
      fileName: 'TradeReporting(all)',
    };
    this.gridApi?.exportDataAsExcel(params);
  }

  protected exportExcel() {
    this.gridApi?.exportDataAsExcel({
      fileName: 'TradeReporting',
    });
  }
}
