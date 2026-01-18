import { formatCurrency, formatNumber, formatPercent } from '@angular/common';

export const localeText = {
  // for filter panel
  page: 'стр.',
  more: 'еще',
  to: 'к',
  of: 'от',
  next: 'след.',
  last: 'пред.',
  first: 'первая',
  previous: 'последняя',
  loadingOoo: 'Загружаем...',

  // for set filter
  selectAll: 'Выбрать все',
  selectAllSearchResults: 'Выбрать все найденные',
  searchOoo: 'Поиск...',
  blanks: 'пусто',

  // for number filter and text filter
  filterOoo: 'Фильтр',
  applyFilter: 'Применить',
  clearFilter: 'Очистить',
  cancelFilter: 'Сбросить',
  resetFilter: 'Сбросить',

  // for number filter
  equals: 'равно',
  notEqual: 'не равно',
  lessThan: 'меньше',
  greaterThan: 'больше',
  lessThanOrEqual: 'меньше либо равно',
  greaterThanOrEqual: 'больше либо равно',
  inRange: 'в диапазоне',

  // Filter Conditions
  andCondition: 'и',
  orCondition: 'или',

  // for text filter
  contains: 'содержит',
  notContains: 'не содержит',
  startsWith: 'начинается',
  endsWith: 'заканчивается',

  // the header of the default group column
  group: 'Группа',

  // tool panel
  columns: 'Колонки',
  rowGroupColumns: 'Pivot Cols',
  rowGroupColumnsEmptyMessage: 'Перетащите колонку для группировки по ней',
  valueColumns: 'Value Cols',
  pivotMode: 'Pivot-Mode',
  groups: 'Группировать',
  values: 'Вычисления',
  pivots: 'Pivots',
  valueColumnsEmptyMessage: 'Перетащите колонку для вичислений по ней',
  pivotColumnsEmptyMessage: 'drag here to pivot',
  toolPanelButton: 'Панель инструментов',

  // other
  noRowsToShow: 'Нечего показывать',

  // enterprise menu
  pinColumn: 'Закрепить колонку',
  valueAggregation: 'Агрегирование значений',
  autosizeThiscolumn: 'Автоширина текущей колонки',
  autosizeAllColumns: 'Автоширина всех колонок',
  groupBy: 'Группировать по',
  ungroupBy: 'Разгруппировать по',
  resetColumns: 'Восстановить настройки по умолчанию для всех колонок',
  expandAll: 'Развернуть все',
  collapseAll: 'Свернуть все',
  toolPanel: 'Панель инструментов',
  export: 'Экспортировать',
  csvExport: 'Экспортировать в CSV',
  excelExport: 'Экспортировать в Excel',

  // enterprise menu pinning
  pinLeft: 'Закрепить столбец слева',
  pinRight: 'Закрепить столбец справа',
  noPin: 'Сбросить закрепление столбца',

  // enterprise menu aggregation and status bar
  sum: 'Сумма',
  min: 'Минимум',
  max: 'Максимум',
  none: 'None',
  count: 'Выделено',
  avg: 'Среднее',
  selectedRows: 'Выбрано',
  filteredRows: 'Отфильтровано',
  totalAndFilteredRows: 'Строк',

  // standard menu
  copy: 'Копировать',
  copyWithHeaders: 'Копировать с заголовками',
  ctrlC: 'ctrl + C',
  paste: 'Вставить',
  ctrlV: 'ctrl + V',
  rows: 'строк',
};

export const dateFormatter = ({ value }): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  // const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return new Date(value).toLocaleDateString('ru-RU', options);
};

export const delPercentFormatter = (params) => {
  if (params.value && params.value !== 0) {
    const val = +params.value;
    return formatPercent(val / 100, 'ru-RU');
  } else {
    return null;
  }
};

export const currencyFormatter = (params) => {
  if (params.value && params.value !== 0) {
    const val = +params.value;
    return formatCurrency(val, 'ru-RU', '');
  } else {
    return null;
  }
};

export const numericFormatter = (params) => {
  if (params.value && params.value !== 0) {
    const val = +params.value;
    return formatNumber(val, 'ru-RU', '1.2-2');
  } else {
    return null;
  }
};

export const percentFormatter = (params) => {
  if (params.value && params.value !== 0) {
    const val = +params.value;
    return formatPercent(val, 'ru-RU');
  } else {
    return null;
  }
};

export enum AgGridFilterType {
  SET = 'set',
  DATE = 'date',
  NUMBER = 'number',
  TEXT = 'text',
}

export enum AgGridFilterTypeOperation {
  EQUALS = 'equals',
  IN_RANGE = 'inRange',
  GREATER_THAN = 'greaterThan',
}

export interface AgGridFilterValue {
  values: string[];
  filterType: AgGridFilterType;
}
