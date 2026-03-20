import { cleanObject } from './utils';

describe('cleanObject', () => {
  it('should remove null, 0, empty string, empty array, and empty object', () => {
    const input = {
      a: null,
      b: 0,
      c: '',
      d: [],
      e: {},
      f: 'ok',
      g: 1,
      h: false,
      i: undefined,
      j: [1],
      k: { x: 1 },
    } as const;

    expect(cleanObject(input)).toEqual({
      f: 'ok',
      g: 1,
      h: false,
      j: [1],
      k: { x: 1 },
    });
  });

  it('should return empty object if all values are null, 0, empty string, empty array, and empty object', () => {
    const input = {
      a: null,
      b: 0,
      c: '',
      d: [],
      e: {},
      i: undefined,
      f: new Date(0),
    };
    expect(cleanObject(input)).toEqual({});
  });

  it('should deep-clean nested values', () => {
    const input = {
      outer: { innerEmpty: {} },
      arr: [{}, { a: 1 }],
    };

    expect(cleanObject(input)).toEqual({
      arr: [{ a: 1 }],
    });
  });

  it('should keep valid Date values (and drop invalid Date values)', () => {
    const valid = new Date('2026-03-18T00:00:00.000Z');
    const zero = new Date(0);
    const invalid = new Date('not-a-date');
    const input = {
      createdAt: valid,
      brokenAt: invalid,
      emptyObj: {},
      zero: zero,
    };

    expect(cleanObject(input)).toEqual({
      createdAt: valid,
    });
  });

  it('should deep-clean nested plain objects', () => {
    const input = {
      a: {
        b: null,
        zero: 0,
        c: 1,
        d: {
          e: '',
          f: { e: {} },
          g: 'x',
        },
      },
    };

    expect(cleanObject(input)).toEqual({
      a: {
        c: 1,
        d: {
          g: 'x',
        },
      },
    });
  });

  it('should return empty object', () => {
    const input = {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: { h: [] },
                },
              },
            },
          },
        },
      },
    };

    expect(cleanObject(input)).toEqual({});
  });

  it('should deep-clean arrays and drop them if they become empty', () => {
    const valid = new Date('2026-03-18T00:00:00.000Z');
    const zero = new Date(0);
    const invalid = new Date('not-a-date');
    const input = {
      items: [null, 0, '', {}, [], 1, { a: null, b: 2 }, valid, invalid],
      emptyItems: [null, 0, '', {}, []],
      zero: zero,
    };

    expect(cleanObject(input)).toEqual({
      items: [1, { b: 2 }, valid],
    });
  });

  it('should not mutate the input object', () => {
    const input: Record<string, unknown> = { a: null, b: 1 };
    const before = { ...input };

    cleanObject(input);

    expect(input).toEqual(before);
  });
});
