import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DD_MM_YYYY, YYYY_MM_DD } from '@sotbi/utils';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { AgGridAngular } from 'ag-grid-angular';
import type { GridOptions, ValueFormatterParams } from 'ag-grid-community';

import { localeText } from './ag-grid.common';
import {
  DatePickerEditor,
  TimePickerEditor,
} from './date-picker-editor.component';

interface DateRow {
  id: number;
  label: string;
  date: Date | null;
}

interface TimeRow {
  id: number;
  label: string;
  minutes: number;
}

const DEFAULT_DATE_ROWS: DateRow[] = [
  { id: 1, label: 'Дата начала', date: new Date(2024, 5, 15) },
  { id: 2, label: 'Дата окончания', date: null },
  { id: 3, label: 'Дедлайн', date: new Date(2025, 0, 31) },
];

const DEFAULT_TIME_ROWS: TimeRow[] = [
  { id: 1, label: 'Начало смены', minutes: 540 },
  { id: 2, label: 'Конец смены', minutes: 1080 },
];

@Component({
  selector: 'lib-date-picker-editor-story-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
  template: `
    <p class="mb-2 text-sm text-gray-600">
      Кликните по ячейке «Дата», чтобы открыть редактор.
    </p>
    <ag-grid-angular
      class="ag-theme-balham"
      style="width: 100%; height: 220px"
      [rowData]="rows"
      [gridOptions]="gridOptions"
    />
  `,
})
class DatePickerEditorStoryHost {
  @Input()
  public readOnly = false;

  @Input()
  public minDate: Date | null = null;

  @Input()
  public maxDate: Date | null = null;

  @Input()
  public set rows(value: DateRow[] | null | undefined) {
    this._rows = value?.length ? value : DEFAULT_DATE_ROWS;
  }

  public get rows(): DateRow[] {
    return this._rows;
  }

  private _rows: DateRow[] = DEFAULT_DATE_ROWS;

  protected readonly gridOptions: GridOptions<DateRow> = {
    localeText,
    singleClickEdit: true,
    stopEditingWhenCellsLoseFocus: true,
    onFirstDataRendered: ({ api }) => api.sizeColumnsToFit(),
    components: {
      datePickerEditor: DatePickerEditor,
    },
    defaultColDef: {
      editable: true,
      resizable: true,
      sortable: false,
      filter: false,
    },
    columnDefs: [
      {
        field: 'label',
        headerName: 'Поле',
        editable: false,
        flex: 1,
      },
      {
        field: 'date',
        headerName: 'Дата',
        flex: 1,
        cellEditor: 'datePickerEditor',
        cellEditorParams: () => ({
          readonly: this.readOnly,
          min: this.minDate
            ? formatDate(this.minDate, YYYY_MM_DD, 'ru-RU')
            : null,
          max: this.maxDate
            ? formatDate(this.maxDate, YYYY_MM_DD, 'ru-RU')
            : null,
        }),
        valueFormatter: (params: ValueFormatterParams<DateRow, Date | null>) =>
          params.value ? formatDate(params.value, DD_MM_YYYY, 'ru-RU') : '',
      },
    ],
  };
}

@Component({
  selector: 'lib-time-picker-editor-story-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
  template: `
    <p class="mb-2 text-sm text-gray-600">
      Кликните по ячейке «Время», чтобы открыть редактор.
    </p>
    <ag-grid-angular
      class="ag-theme-balham"
      style="width: 100%; height: 180px"
      [rowData]="rows"
      [gridOptions]="gridOptions"
    />
  `,
})
class TimePickerEditorStoryHost {
  @Input()
  public set rows(value: TimeRow[] | null | undefined) {
    this._rows = value?.length ? value : DEFAULT_TIME_ROWS;
  }

  public get rows(): TimeRow[] {
    return this._rows;
  }

  private _rows: TimeRow[] = DEFAULT_TIME_ROWS;

  protected readonly gridOptions: GridOptions<TimeRow> = {
    localeText,
    singleClickEdit: true,
    stopEditingWhenCellsLoseFocus: true,
    onFirstDataRendered: ({ api }) => api.sizeColumnsToFit(),
    components: {
      timePickerEditor: TimePickerEditor,
    },
    defaultColDef: {
      editable: true,
      resizable: true,
      sortable: false,
      filter: false,
    },
    columnDefs: [
      {
        field: 'label',
        headerName: 'Поле',
        editable: false,
        flex: 1,
      },
      {
        field: 'minutes',
        headerName: 'Время',
        flex: 1,
        cellEditor: 'timePickerEditor',
        valueFormatter: ({ value }) => {
          if (value == null) {
            return '';
          }
          const hours = Math.floor(value / 60);
          const mins = value % 60;
          return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        },
      },
    ],
  };
}

const meta: Meta<DatePickerEditorStoryHost> = {
  title: 'CellEditors/DatePickerEditor',
  component: DatePickerEditorStoryHost,
  tags: ['autodocs'],
  args: {
    rows: DEFAULT_DATE_ROWS,
    readOnly: false,
    minDate: null,
    maxDate: null,
  },
};

export default meta;

type Story = StoryObj<DatePickerEditorStoryHost>;

export const Default: Story = {};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    rows: [
      { id: 1, label: 'Дата начала', date: new Date(2024, 5, 15) },
      { id: 2, label: 'Дата окончания', date: new Date(2024, 11, 31) },
    ],
  },
};

export const WithMinMax: Story = {
  args: {
    minDate: new Date(2026, 6, 1),
    maxDate: new Date(2026, 6, 31),
    rows: [
      {
        id: 1,
        label: 'В пределах июня 2026 года',
        date: new Date(2026, 6, 15),
      },
      { id: 2, label: 'Пустая дата', date: null },
    ],
  },
};

export const EmptyDates: Story = {
  args: {
    rows: [
      { id: 1, label: 'Без значения', date: null },
      { id: 2, label: 'Тоже пусто', date: null },
    ],
  },
};

export const TimePicker: StoryObj<TimePickerEditorStoryHost> = {
  decorators: [
    moduleMetadata({
      imports: [TimePickerEditorStoryHost],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `<lib-time-picker-editor-story-host [rows]="rows" />`,
  }),
  args: {
    rows: DEFAULT_TIME_ROWS,
  },
};
