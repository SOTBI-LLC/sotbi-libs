/**
 * Конвертация суммы в рублях в текст для платёжных поручений.
 *
 * Формат (стандарт ЦБ РФ):
 *   рубли — прописью, копейки — цифрами
 *   "Одна тысяча двести тридцать четыре рубля 56 копеек"
 *
 * Поддерживаемый диапазон: 0 — 999 999 999 999 999.99
 */

// ─── Словари ────────────────────────────────────────────────────────────────

const ONES_M = [
  '',
  'один',
  'два',
  'три',
  'четыре',
  'пять',
  'шесть',
  'семь',
  'восемь',
  'девять',
] as const;
const ONES_F = [
  '',
  'одна',
  'две',
  'три',
  'четыре',
  'пять',
  'шесть',
  'семь',
  'восемь',
  'девять',
] as const;

const TEENS = [
  'десять',
  'одиннадцать',
  'двенадцать',
  'тринадцать',
  'четырнадцать',
  'пятнадцать',
  'шестнадцать',
  'семнадцать',
  'восемнадцать',
  'девятнадцать',
] as const;

const TENS = [
  '',
  'десять',
  'двадцать',
  'тридцать',
  'сорок',
  'пятьдесят',
  'шестьдесят',
  'семьдесят',
  'восемьдесят',
  'девяносто',
] as const;

const HUNDREDS = [
  '',
  'сто',
  'двести',
  'триста',
  'четыреста',
  'пятьсот',
  'шестьсот',
  'семьсот',
  'восемьсот',
  'девятьсот',
] as const;

// ─── Склонение ───────────────────────────────────────────────────────────────

type Declension = readonly [string, string, string]; // [1, 2–4, 5–20]

const RUB: Declension = ['рубль', 'рубля', 'рублей'] as const;
const KOP: Declension = ['копейка', 'копейки', 'копеек'] as const;
const THS: Declension = ['тысяча', 'тысячи', 'тысяч'] as const;
const MLN: Declension = ['миллион', 'миллиона', 'миллионов'] as const;
const BLN: Declension = ['миллиард', 'миллиарда', 'миллиардов'] as const;
const TLN: Declension = ['триллион', 'триллиона', 'триллионов'] as const;

const decline = (n: number, [f1, f2, f5]: Declension): string => {
  const mod100 = Math.abs(n) % 100;
  const mod10 = mod100 % 10;
  if (mod100 >= 11 && mod100 <= 19) return f5;
  if (mod10 === 1) return f1;
  if (mod10 >= 2 && mod10 <= 4) return f2;
  return f5;
};

// ─── Трёхзначный блок → слова ────────────────────────────────────────────────

const chunkToWords = (n: number, female: boolean): string => {
  if (n === 0) return '';

  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const t = Math.floor(rest / 10);
  const o = rest % 10;

  if (h) parts.push(HUNDREDS[h]);

  if (rest >= 10 && rest <= 19) {
    parts.push(TEENS[rest - 10]);
  } else {
    if (t) parts.push(TENS[t]);
    if (o) parts.push(female ? ONES_F[o] : ONES_M[o]);
  }

  return parts.join(' ');
};

// ─── Целое число → слова ─────────────────────────────────────────────────────

const UPPER_GROUPS: Array<{
  divisor: number;
  forms: Declension;
  female: boolean;
}> = [
  { divisor: 1_000_000_000_000, forms: TLN, female: false },
  { divisor: 1_000_000_000, forms: BLN, female: false },
  { divisor: 1_000_000, forms: MLN, female: false },
  { divisor: 1_000, forms: THS, female: true },
];

const integerToWords = (n: number): string => {
  if (n === 0) return 'ноль';

  const parts: string[] = [];

  for (const { divisor, forms, female } of UPPER_GROUPS) {
    const groupValue = Math.floor(n / divisor) % 1_000;
    if (groupValue === 0) continue;
    parts.push(chunkToWords(groupValue, female));
    parts.push(decline(groupValue, forms));
  }

  const rubleChunk = n % 1_000;
  if (rubleChunk > 0) {
    parts.push(chunkToWords(rubleChunk, false));
  }

  return parts.filter(Boolean).join(' ');
};

// ─── Публичный API ────────────────────────────────────────────────────────────

/**
 * Конвертирует сумму в рублях в строку для поля «Сумма прописью».
 *
 * @param amount  сумма в рублях (число или строка, копейки — дробная часть)
 * @returns       строка вида «Одна тысяча двести тридцать четыре рубля 56 копеек»
 *
 * @example
 * amountToWords(1234.56)  // "Одна тысяча двести тридцать четыре рубля 56 копеек"
 * amountToWords(100)      // "Сто рублей 00 копеек"
 * amountToWords(0)        // "Ноль рублей 00 копеек"
 * amountToWords(0.05)     // "Ноль рублей 05 копеек"
 * amountToWords(0.01)     // "Ноль рублей 01 копейка"
 * amountToWords(1001.01)  // "Одна тысяча один рубль 01 копейка"
 * amountToWords(2000000)  // "Два миллиона рублей 00 копеек"
 * amountToWords('999999.99')  // "Девятьсот девяносто девять тысяч девятьсот девяносто девять рублей 99 копеек"
 */
export const amountToWords = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (!isFinite(num) || num < 0) {
    throw new RangeError(`amountToWords: недопустимое значение "${amount}"`);
  }

  // Работаем в копейках — избегаем проблем с floating point
  const totalKopecks = Math.round(num * 100);
  const rubles = Math.floor(totalKopecks / 100);
  const kopecks = totalKopecks % 100;

  const rubWords = rubles === 0 ? 'ноль' : integerToWords(rubles);
  const rubForm = decline(rubles, RUB);
  const kopStr = kopecks.toString().padStart(2, '0');
  const kopForm = decline(kopecks, KOP);

  const result = `${rubWords} ${rubForm} ${kopStr} ${kopForm}`;

  return result.charAt(0).toUpperCase() + result.slice(1);
};
