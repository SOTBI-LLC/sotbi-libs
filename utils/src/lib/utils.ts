import type { Bankruptcy } from '@sotbi/models';
import { equals } from 'ramda';

export const removeProperty =
  (prop: string) =>
  ({ [prop]: _, ...rest }) =>
    rest;
export const removeID = removeProperty('id');

export const CHARSET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const toBase62 = (int: number): string => {
  if (int === 0) {
    return CHARSET[0];
  }

  let res = '';
  while (int > 0) {
    res = CHARSET[int % 62] + res;
    int = Math.floor(int / 62);
  }
  return res;
};

export const fromBase62 = (value: string): number => {
  let decoded = 0;
  for (let i = 0; i < value.length; i++) {
    const idx = value.length - i - 1;
    const n = CHARSET.indexOf(value[idx]);
    if (n === -1) {
      throw new Error('not a base-62 input');
    }
    decoded += n * Math.pow(62, i);
  }
  return decoded;
};

export const bankruptcyManagerFormatter = (item: Bankruptcy | null): string => {
  if (!item) {
    return '';
  }
  return `${item?.surname ?? ''} ${item?.name?.[0] ?? ''}. ${item?.patronymicname?.[0] ?? ''}. (ИНН:${
    item?.inn ?? ''
  })`; // , СНИЛС:${bankruptcyManager.snils||''})
};

export const getDiff = <T>(
  oldItem: T,
  newItem: T,
): { changed: boolean; update: Partial<T> | null } => {
  if (!oldItem || !newItem) {
    return { changed: false, update: null };
  }
  const update: Partial<T> = {};
  let changed = false;
  for (const prop in newItem) {
    if (Object.prototype.hasOwnProperty.call(newItem, prop)) {
      const key = prop as keyof T;
      const oldValue = oldItem[key];
      const newValue = newItem[key];
      if (Array.isArray(newValue)) {
        if (!equals(oldValue, newValue)) {
          if ((newValue as []).length > 0) {
            update[key] = newValue;
            changed = true;
          }
        }
      } else if (newValue instanceof Date) {
        if (!equals(oldValue, newValue)) {
          update[key] = newValue;
          changed = true;
        }
      } else if (oldValue !== newValue && newValue) {
        update[key] = newValue;
        changed = true;
      }
    }
  }
  return { changed, update };
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
