import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

// Polyfill structuredClone for Jest jsdom environment (Node.js global not exposed)
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = <T>(value: T): T => {
    if (value === null || typeof value !== 'object') return value;
    if (value instanceof Date) return new Date(value.getTime()) as T;
    if (value instanceof RegExp)
      return new RegExp(value.source, value.flags) as T;
    if (value instanceof Map) {
      return new Map(
        Array.from(value, ([k, v]) => [
          globalThis.structuredClone(k),
          globalThis.structuredClone(v),
        ]),
      ) as T;
    }
    if (value instanceof Set) {
      return new Set(
        Array.from(value, (v) => globalThis.structuredClone(v)),
      ) as T;
    }
    if (Array.isArray(value))
      return value.map((v) => globalThis.structuredClone(v)) as T;
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, globalThis.structuredClone(v)]),
    ) as T;
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Polyfill Jasmine's `fail` for Jest environment
if (typeof (globalThis as any).fail === 'undefined') {
  (globalThis as any).fail = (message?: string) => {
    throw new Error(message || 'Test failed');
  };
}

setupZonelessTestEnv();
