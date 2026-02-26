export { generateAvatarSvgUrl } from './lib/avatars/generate';
export { fromBase62, toBase62 } from './lib/base62';
export { Level, maskForSumm } from './lib/consts';
export { getDateDifference } from './lib/date-func/difference';
export {
  dateValueFormatter,
  DD_MM_YY,
  DD_MM_YY_HH_MM,
  DD_MM_YYYY,
  DD_MM_YYYY_HH_MM,
  DD_MM_YYYY_HH_MM_SS,
  formatEventDuraton,
  FormatMonth,
  getMonthNameFunction,
  HH_MM,
  MM_YYYY,
} from './lib/date-func/format';
export { MONTH_NAMES, RUS_MONTH } from './lib/date-func/locale';
export { parseStrToDate } from './lib/date-func/parse';
export {
  deepEqual,
  deepFlatten,
  extractProperty,
  getDiff,
  removeID,
  WithId,
} from './lib/prop';
export { amountToWords } from './lib/propis';
export {
  ArrFromMap,
  forMap,
  forMapStringNumber,
  notEmptyArray,
  notEmptyMap,
  notEmptyObject,
} from './lib/rx-filtres';
export {
  bankruptcyManagerFormatter,
  canSave,
  comparator,
  dateFilterParams,
  isAllSaved,
  notifyError,
  paramsToOptions,
  uniqueElementsBy,
} from './lib/utils';
