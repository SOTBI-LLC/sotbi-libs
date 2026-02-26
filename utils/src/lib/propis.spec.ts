import { amountToWords } from './propis';

describe('amountToWords', () => {
  describe('Examples from JSDoc', () => {
    it('amountToWords(1234.56) → "Одна тысяча двести тридцать четыре рубля 56 копеек"', () => {
      expect(amountToWords(1234.56)).toBe(
        'Одна тысяча двести тридцать четыре рубля 56 копеек',
      );
    });

    it('amountToWords(100) → "Сто рублей 00 копеек"', () => {
      expect(amountToWords(100)).toBe('Сто рублей 00 копеек');
    });

    it('amountToWords(0) → "Ноль рублей 00 копеек"', () => {
      expect(amountToWords(0)).toBe('Ноль рублей 00 копеек');
    });

    it('amountToWords(0.05) → "Ноль рублей 05 копеек"', () => {
      expect(amountToWords(0.05)).toBe('Ноль рублей 05 копеек');
    });

    it('amountToWords(0.01) → "Ноль рублей 01 копейка"', () => {
      expect(amountToWords(0.01)).toBe('Ноль рублей 01 копейка');
    });

    it('amountToWords(1001.01) → "Одна тысяча один рубль 01 копейка"', () => {
      expect(amountToWords(1001.01)).toBe('Одна тысяча один рубль 01 копейка');
    });

    it('amountToWords(2000000) → "Два миллиона рублей 00 копеек"', () => {
      expect(amountToWords(2000000)).toBe('Два миллиона рублей 00 копеек');
    });

    it('amountToWords("999999.99") → "Девятьсот девяносто девять тысяч девятьсот девяносто девять рублей 99 копеек"', () => {
      expect(amountToWords('999999.99')).toBe(
        'Девятьсот девяносто девять тысяч девятьсот девяносто девять рублей 99 копеек',
      );
    });
  });

  describe('Edge cases and validation', () => {
    it('should throw RangeError for negative amount', () => {
      expect(() => amountToWords(-1)).toThrow(
        new RangeError('amountToWords: недопустимое значение "-1"'),
      );
    });

    it('should throw RangeError for NaN', () => {
      expect(() => amountToWords(NaN)).toThrow(
        new RangeError('amountToWords: недопустимое значение "NaN"'),
      );
    });

    it('should throw RangeError for invalid string', () => {
      expect(() => amountToWords('invalid')).toThrow(
        new RangeError('amountToWords: недопустимое значение "invalid"'),
      );
    });
  });
});
