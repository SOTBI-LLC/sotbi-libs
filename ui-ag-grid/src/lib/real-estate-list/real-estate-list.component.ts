import { Component, OnInit, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ButtonRendererComponent } from '../button-renderer.component';
import { IMaskEdit } from '../imask-edit.component';
import { localeText } from '../ag-grid.common';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClassParams, ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { CheckNumEditor, CheckNumEditorParams } from '../check-num/check-num.component';
import { DropFileComponent, DropFileParams } from '../drop-file/drop-file.component';
import { RealEstateForm } from '../real-estate-form';

@Component({
  selector: 'real-estate-list',
  template: `
    <ag-grid-angular
      #agGrid
      id="myGrid"
      class="ag-theme-balham real-estate-list"
      [gridOptions]="gridOptions"
      [rowData]="realEstate()?.value"
      [columnDefs]="columnDefs"
    />
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .real-estate-list {
        min-height: 80px;
        margin-bottom: 0;
      }
    `,
  ],
  imports: [AgGridAngular],
})
export class RealEstateListComponent implements OnInit {
  public readonly delete = output<{ idx: number; id: number }>();
  public readonly realEstate = input<FormArray<FormGroup<RealEstateForm>> | null>(null);
  public readonly showFile = input<boolean>(false);
  public readonly edit = input<boolean>(false);
  public readonly uploadFiles = input.required<DropFileParams['uploadFiles']>();
  public readonly downloadFile = input.required<DropFileParams['downloadFile']>();
  public readonly lookupNumber = input.required<CheckNumEditorParams['lookupNumber']>();

  protected columnDefs: (ColGroupDef | ColDef)[] = [
    {
      headerName: '№ п.п.',
      field: 'count',
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      width: 70,
      minWidth: 60,
      maxWidth: 80,
      valueGetter: (params) => +params.node!.id! + 1,
    },
    {
      headerName: 'Кадастровый №',
      editable: true,
      field: 'cadastral_no',
      cellEditor: IMaskEdit,
      cellEditorParams: {
        mask: '00{:}00{:}000000[0]{:}0[00000]',
      },
    },
    {
      headerName: 'Иные параметры',
      editable: true,
      field: 'parameters',
      cellEditor: 'agTextCellEditor',
    },
    {
      headerName: 'Комментарии',
      editable: true,
      field: 'description',
      cellEditor: 'agTextCellEditor',
    },
  ];
  private readonly middleColumn: ColDef[] = [
    {
      singleClickEdit: true,
      editable: true,
      headerName: '№ запроса',
      field: 'request_num',
      cellEditor: CheckNumEditor,
      cellEditorParams: () =>
        ({
          lookupNumber: this.lookupNumber(),
        }) satisfies Pick<CheckNumEditorParams, 'lookupNumber'>,
      cellStyle: ({ api, value }: CellClassParams) => {
        const notUniqRows: string[] = [];
        api.forEachNode((node) => {
          if (node.data?.request_num) {
            notUniqRows.push(node.data.request_num.trim());
          }
        });

        // like { request_num: count }
        const unique = notUniqRows.reduce(
          (acc, name) => {
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          },
          {} as { [key: string]: number },
        );

        const duplicates = Object.keys(unique).filter((key) => unique[key] > 1);

        if (value?.startsWith(' ') || duplicates.includes(value + '')) {
          return { background: 'rgb(245, 219, 217)' };
        }
        return undefined;
      },
    },
    {
      singleClickEdit: true,
      editable: true,
      headerName: 'Ключ',
      field: 'key',
      cellEditor: 'agTextCellEditor',
    },
  ];
  private readonly suffixColumn: ColDef = {
    singleClickEdit: true,
    headerName: 'Результат',
    editable: true,
    cellEditor: DropFileComponent,
    cellEditorParams: () => ({
      uploadFiles: this.uploadFiles(),
      downloadFile: this.downloadFile(),
    }),
    valueFormatter: (params) => params.data.original_file_name ?? 'Загрузить...',
    valueSetter: ({ newValue, data, node }) => {
      data.file = newValue.file;
      data.original_file_name = newValue.original_file_name;
      const fg = this.realEstate()?.controls[node!.rowIndex!];
      fg?.patchValue({ ['file']: newValue.file });
      fg?.patchValue({ ['original_file_name']: newValue.original_file_name });
      return !!newValue.file;
    },
  };
  private readonly endColumn: ColDef = {
    headerName: '⋮',
    sortable: false,
    filter: false,
    suppressHeaderMenuButton: true,
    headerTooltip: 'Удалить',
    cellRenderer: ButtonRendererComponent,
    editable: false,
    minWidth: 25,
    width: 50,
    cellRendererParams: {
      onClick: (id: number, idx: number) => this.onDelClick(idx, id),
      label: 'Удалить',
    },
  };
  protected readonly gridOptions: GridOptions = {
    onFirstDataRendered: ({ api }) => {
      api.sizeColumnsToFit();
    },
    localeText,
    domLayout: 'autoHeight',
    singleClickEdit: true,
    overlayLoadingTemplate: '<span class="spinner"></span>',
    animateRows: true,
    defaultColDef: {
      editable: true,
      resizable: true,
      sortable: true,
      filter: true,
      width: 120,
      onCellValueChanged: (params) => params && this.onCellValueChanged(params),
      menuTabs: ['filterMenuTab'],
      filterParams: {
        excelMode: 'windows',
        buttons: ['clear', 'apply'],
        closeOnApply: true,
      },
    },
  };

  public ngOnInit(): void {
    if (this.showFile() && this.edit()) {
      this.columnDefs = [
        ...this.columnDefs,
        ...this.middleColumn,
        this.suffixColumn,
        this.endColumn,
      ];
    } else if (this.edit()) {
      this.columnDefs = [...this.columnDefs, ...this.middleColumn, this.endColumn];
    } else {
      this.columnDefs = [...this.columnDefs, this.endColumn];
    }
  }

  private onCellValueChanged({ node, colDef, newValue }) {
    const fg = this.realEstate()?.controls[node.rowIndex!];
    // eslint-disable-next-line no-prototype-builtins
    if (fg?.value.hasOwnProperty(colDef.field)) {
      fg.patchValue({ [colDef.field]: newValue });
    }
  }

  private onDelClick(idx: number, id: number): void {
    if (id) {
      this.delete.emit({ idx, id });
    }
    this.realEstate()?.removeAt(idx);
  }
}
