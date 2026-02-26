import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { FormArray } from '@angular/forms';
import type { Employee, itemMapPair, UserShort } from '@sotbi/models';
import { ContourType, ContourTypeArr, PositionTypeArr } from '@sotbi/models';
import { dateFilterParams, DD_MM_YYYY } from '@sotbi/utils';
import { AgGridAngular } from 'ag-grid-angular';
import type {
  ColDef,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  ISelectCellEditorParams,
  NewValueParams,
  RowNode,
  SideBarDef,
  ValueFormatterParams,
} from 'ag-grid-community';
import { localeText } from '../ag-grid.common';
import { ButtonActionsComponent } from '../button-actions.component';
import { DatePickerEditor } from '../date-picker-editor.component';
import { RightSideBarAgGridComponent } from '../right-side-bar.component';
import { UserWithAvatarComponent } from '../user-with-avatar.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss'],
  imports: [AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesListComponent {
  public readonly employeesList = input.required<FormArray>();
  public readonly isEdit = input<boolean>(false);
  public readonly users = input<UserShort[]>([]);
  public readonly usersMap = input<itemMapPair<string>>(new Map());

  protected readonly gridOptions: GridOptions = {
    defaultColDef: {
      editable: () => this.isEdit(),
      resizable: true,
      sortable: false,
      filter: false,
      menuTabs: ['filterMenuTab', 'generalMenuTab', 'columnsMenuTab'],
      filterParams: {
        excelMode: 'windows',
        buttons: ['clear', 'apply'],
        closeOnApply: true,
      },
    },
    onFirstDataRendered: ({ api }) => api.sizeColumnsToFit(),
    localeText,
    rowNumbers: true,
    singleClickEdit: true,
    overlayLoadingTemplate: '<span class="spinner"></span>',
    icons: { additional: '<span class="ag-icon ag-icon-additional"></span>' },
    domLayout: 'autoHeight',
    components: {
      rightSideBar: RightSideBarAgGridComponent,
      datePickerEditor: DatePickerEditor,
      userWithAvatarComponent: UserWithAvatarComponent,
      actionButtons: ButtonActionsComponent,
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
            suppressRowGroups: true,
            suppressValues: true,
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
  protected readonly columnDefs: ColDef[] = [
    {
      headerName: 'ФИО',
      field: 'user_name',
      editable: ({ data }) => {
        const worker: Employee = data;
        return worker.contour_type === ContourType.External && this.isEdit();
      },
      onCellValueChanged: (params) => this.onCellValueChanged(params),
    },
    {
      headerName: 'Пользователь',
      field: 'user_id',
      cellEditor: 'agRichSelectCellEditor',
      cellEditorParams: () => {
        return {
          values: this.users(),
          formatValue: (v: UserShort) => v.user,
          allowTyping: true,
          filterList: true,
        };
      },
      onCellValueChanged: (params) => this.onCellValueChanged(params),
      cellRenderer: 'userWithAvatarComponent',
      cellRendererParams: ({ data }: ICellRendererParams<Employee>) => {
        return {
          user: this.usersMap()?.get(data?.id ?? 0)?.[0] ?? '',
          avatar: this.usersMap()?.get(data?.id ?? 0)?.[1] ?? '',
        };
      },
      editable: ({ data }) => {
        const worker: Employee = data;
        return worker.contour_type === ContourType.Internal && this.isEdit();
      },
    },
    {
      headerName: 'Должность',
      field: 'position',
      onCellValueChanged: (params) => this.onCellValueChanged(params),
    },
    {
      headerName: 'Дата трудоустройства',
      field: 'start',
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      maxWidth: 150,
      cellEditor: 'datePickerEditor',
      valueFormatter: ({ value }: ValueFormatterParams<Employee, Date>) => {
        if (value) {
          return formatDate(value, DD_MM_YYYY, 'ru-RU');
        }
        return '';
      },
      onCellValueChanged: (params) => this.onCellValueChanged(params),
    },
    {
      headerName: 'Дата увольнения',
      field: 'stop',
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      maxWidth: 150,
      cellEditor: 'datePickerEditor',
      valueFormatter: ({ value }: ValueFormatterParams<Employee, Date>) => {
        if (value) {
          return formatDate(value, DD_MM_YYYY, 'ru-RU');
        }
        return '';
      },
      editable: ({ data }) => {
        const worker: Employee = data;
        return !worker.is_work_now && this.isEdit();
      },
      onCellValueChanged: (params) => this.onCellValueChanged(params),
    },
    {
      headerName: 'Работает сейчас',
      field: 'is_work_now',
      filter: 'agDateColumnFilter',
      filterParams: dateFilterParams,
      maxWidth: 150,
      cellEditor: 'agCheckboxCellEditor',
      cellRenderer: 'agCheckboxCellRenderer',
      cellRendererParams: () => {
        return {
          disabled: true,
        };
      },
      valueSetter: ({ data, newValue }) => {
        const dataModel: Employee = data;
        dataModel.is_work_now = newValue;
        if (dataModel.is_work_now) {
          dataModel.stop = null;
        }
        return true;
      },
    },
    {
      headerName: 'Тип',
      field: 'position_type',
      maxWidth: 120,
      minWidth: 120,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: PositionTypeArr,
      } as ISelectCellEditorParams,
      onCellValueChanged: (params) => this.onCellValueChanged(params),
    },
    {
      headerName: 'Контур',
      field: 'contour_type',
      maxWidth: 120,
      minWidth: 120,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ContourTypeArr,
      } as ISelectCellEditorParams,
      valueSetter: ({ data, newValue }) => {
        const dataModel: Employee = data;
        dataModel.contour_type = newValue;
        if (newValue === ContourType.Internal) {
          dataModel.user_name = null;
        } else {
          dataModel.user_name = null;
          dataModel.user_id = null;
        }
        return true;
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
      cellRendererParams: () => {
        return {
          onDelete: (row: RowNode<Employee>) => {
            if (row.rowIndex) {
              this.employeesList()?.removeAt(row.rowIndex);
            }
          },
        };
      },
    },
  ];

  protected onGridReady({ api }: GridReadyEvent): void {
    api.hideOverlay();
  }

  // addNewEmployee(): void {
  //   this.employeesList()?.push(makeWorker(null));
  //   this.gridApi.updateGridOptions({ rowData: this.employeesList()?.value ?? [] });
  //   setTimeout(() => {
  //     this.gridApi.sizeColumnsToFit();
  //   }, 1);
  // }

  private onCellValueChanged({
    node,
    colDef,
    newValue,
  }: NewValueParams<Employee>): void {
    const fg = this.employeesList()?.at(Number(node?.id));
    if (colDef?.field && fg?.get(colDef?.field)) {
      fg.patchValue({ ...fg.value, [colDef.field]: newValue });
      fg.markAsDirty();
      fg.updateValueAndValidity();
    }
  }
}
