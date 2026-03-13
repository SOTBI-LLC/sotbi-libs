import { HttpParams } from '@angular/common/http';

export const bankruptcyManagerFormatter = (
  item: {
    surname: string | null;
    name: string;
    patronymicname: string | null;
    inn: string | null;
  } | null,
): string => {
  if (!item) {
    return '';
  }
  return `${item?.surname ?? ''} ${item?.name?.[0] ?? ''}. ${item?.patronymicname?.[0] ?? ''}. (ИНН:${
    item?.inn ?? ''
  })`; // , СНИЛС:${bankruptcyManager.snils||''})
};

export const canSave = <T extends { dirty?: boolean }>(
  items: T[],
  requiredFields: string[],
): boolean => {
  const fields = new Set(requiredFields);
  const dirties = items.filter((el) => Boolean(el.dirty)); // для всех не сохраненных
  let count = 0;
  for (const item of dirties) {
    const record = item as Record<string, unknown>;
    let filledFields = 0;
    for (const key in record) {
      const value = record[key];
      if (
        Object.prototype.hasOwnProperty.call(record, key) &&
        fields.has(key) &&
        // tslint:disable-next-line: triple-equals
        !(value == null || value == undefined)
      ) {
        filledFields++; // считаем количество заполненных полей
      }
    }
    if (filledFields === fields.size) {
      count++; // если все обязательные поля заполнены
    }
  }
  return count === dirties.length;
};

export const isAllSaved = <T extends { dirty: boolean; id: number }>(
  items: T[],
): boolean => {
  let saved = true;
  for (const item of items) {
    if (item.id > 0) {
      saved = !item.dirty;
    }
  }
  return saved;
};

export const notifyError = (err: unknown): string => {
  if (err && typeof err === 'object') {
    const errRecord = err as Record<string, unknown>;
    const errorObj = errRecord['error'] as Record<string, unknown> | undefined;
    const message = errorObj?.['Message'] ?? errRecord['message'];
    return `Произошла ошибка. ${message ?? ''}`;
  }
  return 'Произошла ошибка';
};

export const uniqueElementsBy = <T>(
  arr: T[],
  fn: (a: T, b: T) => boolean,
): T[] =>
  arr.reduce((acc: T[], v: T) => {
    if (!acc.some((x: T) => fn(v, x))) {
      acc.push(v);
    }
    return acc;
  }, []);

export const paramsToOptions = (
  params: Record<string, string> | number | null = {},
): { params: HttpParams } => {
  const options: { params: HttpParams } = { params: new HttpParams() };
  if (params && typeof params === 'object') {
    for (const prop in params) {
      if (Object.prototype.hasOwnProperty.call(params, prop)) {
        options.params = options.params.set(prop, params[prop]);
      }
    }
  }
  return options;
};

import { isSameDay } from 'date-fns';

export const comparator = (
  filterLocalDateAtMidnight: Date,
  cellValue: string,
) => {
  if (cellValue) {
    const timestamp = Date.parse(cellValue);
    if (!isNaN(timestamp)) {
      const cellDate = new Date(cellValue);
      if (isSameDay(cellDate, filterLocalDateAtMidnight)) {
        return 0;
      } else if (cellDate.getTime() < filterLocalDateAtMidnight.getTime()) {
        return -1;
      } else {
        return 1;
      }
    }
    return -1;
  }
  return -1;
};

export const dateFilterParams = {
  comparator,
  buttons: ['clear', 'apply'],
};

export const cleanObject = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      if (value === null) return false;
      if (value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (
        typeof value === 'object' &&
        value !== null &&
        Object.keys(value).length === 0
      )
        return false;
      return true;
    }),
  ) as Partial<T>;
};
