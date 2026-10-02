import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { FormArray } from '@angular/forms';
import type { Bankruptcy, InsuranceCompany} from '@sotbi/models';
import { InsuranceActiveArr, StatusEnum } from '@sotbi/models';

import {
  addGlobalListener,
  currencyFormatter,
  dateFormatter,
  localeText,
  setGridState,
} from '../ag-grid.common';
import { LinkCellComponent } from '../link-cell-ag-grid.component';
import { RightSideBarAgGridComponent } from '../right-side-bar.component';
import { DownloadAllComponent } from './download-all.component';
import type { DownloadAllParams } from './download-all.component';
import { dateFilterParams, forMap } from '@sotbi/utils';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  SideBarDef,
  ValueFormatterParams,
} from 'ag-grid-community';
import { isBefore } from 'date-fns';

export const sortComparator = (date1: string, date2: string) => {
  return Number(new Date(date1)) - Number(new Date(date2));
};

/** Построитель маршрута ссылки; возвращает команды маршрута для link renderer. */
export type InsuranceLinkBuilder = (id: number) => unknown[];

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- селектор сохранён для совместимости
  selector: 'insurance-list',
  template: `
    <ag-grid-angular
      #agGrid
      id="myGrid"
      class="ag-theme-balham insurance-list"
      [gridOptions]="gridOptions"
      [rowData]="rowData()"
      (gridReady)="onGridReady($event)"
      [columnDefs]="columnDefs"
      (rowDoubleClicked)="onRowDoubleClicked($event)"
      [style.height]="heightGrid()"
    />
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .insurance-list {
        min-height: 80px;
        margin-bottom: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
})
export class InsuranceListComponent {
  // eslint-disable-next-line no-unused-private-class-members
  #edit = false;
  public readonly insuranceList = input<FormArray | unknown[] | undefined>(undefined);
  public readonly heightGrid = input<string>('calc(100vh - 10rem)');
  public readonly openInsurance = output<number>();
  public readonly showDebtor = input<boolean>(true);
  public readonly showCompany = input<boolean>(true);
  public readonly all = input<boolean>(false);
  public readonly downloadAll = input.required<DownloadAllParams['downloadAll']>();
  /** Построитель ссылки должника; по умолчанию /bankruptcy/debtors/<id>/common. */
  public readonly debtorLink = input<InsuranceLinkBuilder | undefined>(undefined);
  /** Построитель ссылки страховой компании; по умолчанию /catalogs/insurance-companies/<id>. */
  public readonly insuranceCompanyLink = input<InsuranceLinkBuilder | undefined>(undefined);

  protected readonly rowData = computed<unknown[]>(() => {
    const list = this.insuranceList();
    return list instanceof FormArray ? (list.value as unknown[]) : (list ?? []);
  });

  protected readonly companies = computed(() => new Map(this.insuranceCompanies().map(forMap)));
  public readonly bankruptcies = input<Bankruptcy[]>([]);
  public readonly insuranceCompanies = input<InsuranceCompany[]>([]);

  public readonly gridOptions: GridOptions = {
    onFirstDataRendered: ({ api }) => {
      api.sizeColumnsToFit();
    },
    localeText,
    singleClickEdit: false,
    overlayLoadingTemplate: '<span class="spinner"></span>',
    icons: { additional: '<span class="ag-icon ag-icon-additional"></span>' },
    animateRows: true,
    components: {
      rightSideBar: RightSideBarAgGridComponent,
    },
    defaultColDef: {
      editable: false,
      resizable: true,
      sortable: true,
      filter: true,
      enablePivot: true,
      enableRowGroup: true,
      width: 120,
      menuTabs: ['filterMenuTab'],
      filterParams: {
        excelMode: 'windows',
        buttons: ['clear', 'apply'],
        closeOnApply: true,
      },
    },
    sideBar: {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Колонки',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressPivotMode: true,
            suppressRowGroups: false,
            suppressValues: false,
          },
        },
        {
          id: 'rightSideBar',
          labelDefault: 'Дополнительно',
          labelKey: 'rightSideBar',
          iconKey: 'additional',
          toolPanel: 'rightSideBar',
        },
      ],
    } as SideBarDef,
  };
  private readonly storeKey = 'insurance-list';
  public readonly columnDefs: ColDef[] = [
    {
      headerName: '№ п.п.',
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      width: 70,
      minWidth: 60,
      maxWidth: 80,
      valueGetter: (params) => {
        const nodeId = params?.node?.id;
        return nodeId === undefined || isNaN(+nodeId) ? '' : +nodeId + 1;
      },
    },
    {
      headerName: 'Статус',
      field: 'status',
      sortable: true,
      valueGetter: (params) => {
        if (!params.data) {
          return -1;
        }
        return +isBefore(new Date(), new Date(params?.data?.to));
      },
      cellRenderer: ({ value }) => {
        if (value === -1) {
          return '';
        } else {
          return `<span class="indicator ${value ? StatusEnum.DONE : StatusEnum.OPEN}">${
            value ? InsuranceActiveArr[+Boolean(value)].ru : InsuranceActiveArr[+Boolean(value)].ru
          }</span>`;
        }
      },
      filterParams: {
        suppressMiniFilter: true,
        buttons: ['clear', 'apply'],
        closeOnApply: true,
        valueFormatter: ({ value }) => InsuranceActiveArr[Number(value)].ru,
      },
    },
    {
      headerName: 'АУ',
      field: 'bankruptcy_manager_id',
      valueGetter: ({ data }) => {
        const bankruptcy = this.bankruptcies().find((el) => el.id === data?.bankruptcy_manager_id);
        return bankruptcy?.show;
      },
    },
    {
      headerName: 'Должник',
      field: 'debtor.name',
      hide: !this.showDebtor(),
      cellRenderer: LinkCellComponent,
      cellRendererParams: ({ data }) => ({
        linkTo: this.debtorLink()
          ? this.debtorLink()!(data?.debtor?.id)
          : ['/bankruptcy', 'debtors', data?.debtor?.id, 'common'],
        value: data.debtor?.name,
      }),
    },
    {
      headerName: 'Страховщик',
      field: 'insurance_company_id',
      hide: !this.showCompany(),
      valueFormatter: ({ value }: ValueFormatterParams) => this.companies().get(value) ?? '',
      cellRenderer: LinkCellComponent,
      cellRendererParams: ({ data }) => ({
        linkTo: this.insuranceCompanyLink()
          ? this.insuranceCompanyLink()!(data.insurance_company_id)
          : ['/catalogs', 'insurance-companies', data.insurance_company_id],
        value: this.companies().get(data.insurance_company_id) ?? '',
      }),
      filterParams: {
        valueFormatter: ({ value }) => this.companies().get(+value) ?? '',
        buttons: ['clear', 'apply'],
        closeOnApply: true,
      },
    },
    {
      headerName: 'Сумма',
      field: 'sum_insured',
      valueFormatter: currencyFormatter as (params: ValueFormatterParams) => string,
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Премия',
      field: 'insurance_premium',
      valueFormatter: currencyFormatter as (params: ValueFormatterParams) => string,
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: 'Начало',
      field: 'from',
      valueFormatter: dateFormatter as (params: ValueFormatterParams) => string,
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      comparator: (date1, date2) => sortComparator(date1, date2),
    },
    {
      headerName: 'Окончание',
      field: 'to',
      valueFormatter: dateFormatter as (params: ValueFormatterParams) => string,
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      comparator: (date1, date2) => sortComparator(date1, date2),
    },
    {
      headerName: 'Приложения',
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      editable: false,
      cellRenderer: DownloadAllComponent,
      cellRendererParams: () =>
        ({
          downloadAll: this.downloadAll(),
        }) satisfies Pick<DownloadAllParams, 'downloadAll'>,
    },
  ];

  private gridApi!: GridApi;

  @Input() public set edit(val: boolean) {
    this.#edit = val;
  }

  constructor() {
    effect(() => {
      if (this.bankruptcies().length > 0) {
        this.gridApi?.refreshCells({
          columns: ['bankruptcy_manager_id'],
          // force: true,
        });
      }
    });
  }

  protected onGridReady({ api }: GridReadyEvent): void {
    this.gridApi = api;
    if (this.all()) {
      addGlobalListener(api, this.storeKey);
      setGridState(api, this.storeKey);
    }
    if (!this.showDebtor()) {
      this.columnDefs.forEach((colDef) => {
        if (colDef.field === 'debtor.name') {
          colDef.hide = true;
        }
      });
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }
    if (!this.showCompany()) {
      this.columnDefs.forEach((colDef) => {
        if (colDef.field === 'insurance_company_id') {
          colDef.hide = true;
        }
      });
      this.gridApi.setGridOption('columnDefs', this.columnDefs);
    }
  }

  protected onRowDoubleClicked({ data }): void {
    if (data) {
      this.openInsurance.emit(data.id);
    }
  }
}
