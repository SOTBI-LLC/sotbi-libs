import { parse } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Парсим строку в дату
 */
export const parseStrToDate = (
  dateStr: string | Date,
  fmt: string,
): Date | null => {
  if (!dateStr || !fmt) {
    return null;
  }
  return parse(dateStr as string, fmt, new Date(), { locale: ru });
};
