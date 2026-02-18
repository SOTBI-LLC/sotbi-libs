import { formatDate } from '@angular/common';
import { MONTH_NAMES, RUS_MONTH } from './locale';

export const MM_YYYY = 'MM.yyyy';
export const DD_MM_YYYY = 'dd.MM.yyyy';
export const DD_MM_YY = 'dd.MM.yy';
export const HH_MM = 'HH:mm';
export const DD_MM_YYYY_HH_MM = `${DD_MM_YYYY} ${HH_MM}`;
export const DD_MM_YY_HH_MM = `${DD_MM_YY} ${HH_MM}`;
export const DD_MM_YYYY_HH_MM_SS = `${DD_MM_YYYY} ${HH_MM}:ss`;

export const FormatMonth = (data: Date) =>
  `${MONTH_NAMES[data.getMonth()]} ${data.getFullYear()}`;

export const formatEventDuraton = (duration: number): string =>
  `${Math.floor(duration / 60)}`.padStart(2, '0') +
  ' ч ' +
  `${duration % 60}`.padStart(2, '0') +
  ' мин';

export const dateValueFormatter = (value: Date | null, hours = false) => {
  return (
    (value &&
      formatDate(value, !hours ? DD_MM_YYYY : DD_MM_YYYY_HH_MM, 'ru-RU')) ||
    ''
  );
};

export const getMonthNameFunction = (month: string): string => {
  return RUS_MONTH.get(month) ?? '';
};
