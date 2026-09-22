import {
  formatCoefficientExact,
  formatCoefficientPercent,
  formatDateOnly,
} from './coefficient-format';

describe('formatCoefficientPercent', () => {
  it('formats zero ten-thousandths as 0,00%', () => {
    expect(formatCoefficientPercent(0)).toBe('0,00%');
  });

  it('formats exact integer percents without fractional noise', () => {
    expect(formatCoefficientPercent(30000)).toBe('300,00%');
    expect(formatCoefficientPercent(100)).toBe('1,00%');
  });

  it('formats the documented example 12550 as 125,50%', () => {
    expect(formatCoefficientPercent(12550)).toBe('125,50%');
  });

  it('formats 3333 as 33,33%', () => {
    expect(formatCoefficientPercent(3333)).toBe('33,33%');
  });

  it('pads hundredths below one percent', () => {
    expect(formatCoefficientPercent(1)).toBe('0,01%');
    expect(formatCoefficientPercent(99)).toBe('0,99%');
  });

  it('stays exact at the uint32 boundary', () => {
    expect(formatCoefficientPercent(4294967295)).toBe('42949672,95%');
  });

  it('rejects negative, fractional and non-finite values', () => {
    expect(() => formatCoefficientPercent(-1)).toThrow(RangeError);
    expect(() => formatCoefficientPercent(12.5)).toThrow(RangeError);
    expect(() => formatCoefficientPercent(Number.NaN)).toThrow(RangeError);
    expect(() => formatCoefficientPercent(Number.POSITIVE_INFINITY)).toThrow(
      RangeError,
    );
  });
});

describe('formatCoefficientExact', () => {
  it('formats zero as 0.0000', () => {
    expect(formatCoefficientExact(0)).toBe('0.0000');
  });

  it('formats the documented example 12550 as 1.2550', () => {
    expect(formatCoefficientExact(12550)).toBe('1.2550');
  });

  it('formats 3333 as 0.3333', () => {
    expect(formatCoefficientExact(3333)).toBe('0.3333');
  });

  it('formats 30000 as 3.0000', () => {
    expect(formatCoefficientExact(30000)).toBe('3.0000');
  });

  it('stays exact at the uint32 boundary', () => {
    expect(formatCoefficientExact(4294967295)).toBe('429496.7295');
  });

  it('rejects negative, fractional and non-finite values', () => {
    expect(() => formatCoefficientExact(-1)).toThrow(RangeError);
    expect(() => formatCoefficientExact(1.5)).toThrow(RangeError);
    expect(() => formatCoefficientExact(Number.NaN)).toThrow(RangeError);
  });
});

describe('formatDateOnly', () => {
  it('renders YYYY-MM-DD as DD.MM.YYYY without timezone shift', () => {
    expect(formatDateOnly('2026-09-17')).toBe('17.09.2026');
    expect(formatDateOnly('2026-01-05')).toBe('05.01.2026');
  });

  it('keeps the calendar day identical to the source string', () => {
    const source = '2024-02-29';
    expect(formatDateOnly(source)).toBe('29.02.2024');
  });

  it('returns malformed input unchanged', () => {
    expect(formatDateOnly('')).toBe('');
    expect(formatDateOnly('2026-9-7')).toBe('2026-9-7');
    expect(formatDateOnly('not-a-date')).toBe('not-a-date');
  });
});
