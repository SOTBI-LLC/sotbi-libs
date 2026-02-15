import { toBase62, fromBase62 } from './base62';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

describe('toBase62', () => {
  describe('Basic Conversion', () => {
    it('should convert 0 to "0"', () => {
      expect(toBase62(0)).toBe('0');
    });

    it('should convert single-digit numbers correctly', () => {
      expect(toBase62(1)).toBe('1');
      expect(toBase62(9)).toBe('9');
    });

    it('should convert to lowercase letters (10-35)', () => {
      expect(toBase62(10)).toBe('a');
      expect(toBase62(35)).toBe('z');
    });

    it('should convert to uppercase letters (36-61)', () => {
      expect(toBase62(36)).toBe('A');
      expect(toBase62(61)).toBe('Z');
    });

    it('should convert two-digit base62 numbers', () => {
      expect(toBase62(62)).toBe('10'); // 1*62 + 0
      expect(toBase62(63)).toBe('11'); // 1*62 + 1
      expect(toBase62(123)).toBe('1Z'); // 1*62 + 61
    });

    it('should convert larger numbers correctly', () => {
      expect(toBase62(100)).toBe('1C'); // 1*62 + 38 (38='C')
      expect(toBase62(1000)).toBe('g8'); // 16*62 + 8 (16='g', 8='8')
      expect(toBase62(3844)).toBe('100'); // 1*62^2 + 0*62 + 0
    });

    it('should convert very large numbers', () => {
      expect(toBase62(10000)).toBe('2Bi'); // 2*62^2 + 37*62 + 44
      expect(toBase62(999999)).toBe('4c91');
      expect(toBase62(1000000)).toBe('4c92');
    });
  });

  describe('Edge Cases', () => {
    it('should handle maximum safe integer', () => {
      const result = toBase62(Number.MAX_SAFE_INTEGER);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle numbers at base62 boundaries', () => {
      expect(toBase62(61)).toBe('Z'); // Last single character
      expect(toBase62(62)).toBe('10'); // First two characters
      expect(toBase62(3843)).toBe('ZZ'); // Last two characters
      expect(toBase62(3844)).toBe('100'); // First three characters
    });
  });

  describe('Consistency and Patterns', () => {
    it('should produce incrementing patterns', () => {
      const results = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(toBase62);
      expect(results).toEqual([
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'a',
        'b',
      ]);
    });

    it('should maintain consistent length for ranges', () => {
      // All single-digit base62 numbers (0-61)
      for (let i = 0; i <= 61; i++) {
        expect(toBase62(i).length).toBe(1);
      }

      // All two-digit base62 numbers (62-3843)
      expect(toBase62(62).length).toBe(2);
      expect(toBase62(3843).length).toBe(2);
    });

    it('should use all 62 characters from charset', () => {
      const charset =
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const results = new Set<string>();

      // Convert first 62 numbers to get all single characters
      for (let i = 0; i < 62; i++) {
        results.add(toBase62(i));
      }

      expect(results.size).toBe(62);
      charset.split('').forEach((char) => {
        expect(results.has(char)).toBe(true);
      });
    });
  });

  describe('Round-Trip Conversion', () => {
    it('should round-trip with fromBase62 for zero', () => {
      const original = 0;
      const encoded = toBase62(original);
      const decoded = fromBase62(encoded);
      expect(decoded).toBe(original);
    });

    it('should round-trip with fromBase62 for small numbers', () => {
      const testNumbers = [1, 10, 25, 50, 61, 62, 100, 500];
      testNumbers.forEach((num) => {
        const encoded = toBase62(num);
        const decoded = fromBase62(encoded);
        expect(decoded).toBe(num);
      });
    });

    it('should round-trip with fromBase62 for large numbers', () => {
      const testNumbers = [1000, 10000, 100000, 999999, 1000000];
      testNumbers.forEach((num) => {
        const encoded = toBase62(num);
        const decoded = fromBase62(encoded);
        expect(decoded).toBe(num);
      });
    });

    it('should round-trip for random numbers', () => {
      const randomNumbers = Array.from(
        { length: 100 },
        () => Math.floor(Math.random() * 1000000),
      );

      randomNumbers.forEach((num) => {
        const encoded = toBase62(num);
        const decoded = fromBase62(encoded);
        expect(decoded).toBe(num);
      });
    });
  });

  describe('Output Format', () => {
    it('should always return a non-empty string', () => {
      const testNumbers = [0, 1, 100, 1000, 10000];
      testNumbers.forEach((num) => {
        const result = toBase62(num);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should only use characters from the charset', () => {
      const charset =
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const testNumbers = [0, 1, 50, 100, 500, 1000, 5000, 10000];

      testNumbers.forEach((num) => {
        const result = toBase62(num);
        result.split('').forEach((char) => {
          expect(charset.includes(char)).toBe(true);
        });
      });
    });

    it('should not have leading zeros (except for zero itself)', () => {
      const testNumbers = [1, 62, 100, 1000, 10000];
      testNumbers.forEach((num) => {
        const result = toBase62(num);
        if (num !== 0) {
          expect(result[0]).not.toBe('0');
        }
      });
    });
  });

  describe('RxJS Pipe Round-Trip Conversion', () => {
    it('should convert to base62 and back to same number using pipe', (done) => {
      const originalNumber = 12345;

      of(originalNumber)
        .pipe(
          map((num) => toBase62(num)),
          map((encoded) => fromBase62(encoded)),
        )
        .subscribe((result) => {
          expect(result).toBe(originalNumber);
          done();
        });
    });

    it('should handle zero in pipe conversion', (done) => {
      of(0)
        .pipe(
          map((num) => toBase62(num)),
          map((encoded) => fromBase62(encoded)),
        )
        .subscribe((result) => {
          expect(result).toBe(0);
          done();
        });
    });

    it('should handle multiple numbers through pipe', (done) => {
      const testNumbers = [0, 1, 10, 61, 62, 100, 1000, 10000, 999999];

      of(...testNumbers)
        .pipe(
          map((num) => ({ original: num, encoded: toBase62(num) })),
          map((data) => ({ ...data, decoded: fromBase62(data.encoded) })),
        )
        .subscribe({
          next: (result) => {
            expect(result.decoded).toBe(result.original);
          },
          complete: () => {
            done();
          },
        });
    });

    it('should handle array of numbers with pipe conversion', (done) => {
      const numbers = [123, 456, 789, 1000, 5000];

      of(numbers)
        .pipe(
          map((nums) =>
            nums.map((num) => ({
              original: num,
              encoded: toBase62(num),
            })),
          ),
          map((data) =>
            data.map((item) => ({
              ...item,
              decoded: fromBase62(item.encoded),
            })),
          ),
        )
        .subscribe((results) => {
          results.forEach((item) => {
            expect(item.decoded).toBe(item.original);
          });
          done();
        });
    });

    it('should preserve number integrity through multiple conversions', (done) => {
      const originalNumber = 54321;

      of(originalNumber)
        .pipe(
          // Convert to base62
          map((num) => toBase62(num)),
          // Convert back to number
          map((encoded) => fromBase62(encoded)),
          // Convert to base62 again
          map((num) => toBase62(num)),
          // Convert back to number again
          map((encoded) => fromBase62(encoded)),
        )
        .subscribe((result) => {
          expect(result).toBe(originalNumber);
          done();
        });
    });

    it('should handle edge case numbers in pipe', (done) => {
      const edgeCases = [
        0,
        1,
        61, // Last single-char
        62, // First two-char
        3843, // Last two-char (ZZ)
        3844, // First three-char (100)
        Number.MAX_SAFE_INTEGER,
      ];

      let processedCount = 0;
      of(...edgeCases)
        .pipe(
          map((num) => toBase62(num)),
          map((encoded) => fromBase62(encoded)),
        )
        .subscribe({
          next: (result) => {
            expect(result).toBe(edgeCases[processedCount]);
            processedCount++;
          },
          complete: () => {
            expect(processedCount).toBe(edgeCases.length);
            done();
          },
        });
    });
  });

  describe('Mathematical Properties', () => {
    it('should produce shorter strings than decimal for large numbers', () => {
      const largeNumber = 1000000;
      const base62Result = toBase62(largeNumber);
      const decimalLength = largeNumber.toString().length;

      expect(base62Result.length).toBeLessThan(decimalLength);
    });

    it('should maintain ordering (larger numbers produce lexicographically greater or equal strings when same length)', () => {
      // For same-length base62 strings, ordering is maintained
      const a = toBase62(100);
      const b = toBase62(200);
      
      // Both should be same length for this property
      if (a.length === b.length) {
        expect(a < b).toBe(true);
      }
    });

    it('should handle sequential numbers predictably', () => {
      const results = [];
      for (let i = 58; i <= 65; i++) {
        results.push({ num: i, base62: toBase62(i) });
      }

      // Verify transition from single to double digit
      expect(results[0].base62).toBe('W'); // 58 (uppercase W at position 58)
      expect(results[3].base62).toBe('Z'); // 61 (last single digit, uppercase Z)
      expect(results[4].base62).toBe('10'); // 62 (first double digit)
      expect(results[7].base62).toBe('13'); // 65
    });
  });
});
