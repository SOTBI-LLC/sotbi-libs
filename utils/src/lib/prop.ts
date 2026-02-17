export type WithId<T> = Partial<T> & { id: number | string };

export const removeProperty =
  (prop: string) =>
  ({ [prop]: _, ...rest }) =>
    rest;
export const removeID = removeProperty('id');

export const extractProperty = <T, K extends keyof T>(
  items: T[],
  key: K,
): T[K][] => {
  return items.map((item) => item[key]);
};

export const getDiff = <T>(
  oldItem: WithId<T>,
  newItem: WithId<T>,
): {
  changed: boolean;
  update: WithId<T> | null;
} => {
  if (!oldItem || !newItem) {
    return { changed: false, update: null };
  }
  const update = { id: oldItem.id } as WithId<T>;
  let changed = false;
  for (const prop in newItem) {
    if (Object.prototype.hasOwnProperty.call(newItem, prop)) {
      const key = prop as keyof T;
      const oldValue = oldItem[key];
      const newValue = newItem[key];
      if (Array.isArray(newValue)) {
        if (!deepEqual(oldValue, newValue)) {
          if ((newValue as []).length > 0) {
            update[key] = newValue;
            changed = true;
          }
        }
      } else if (newValue instanceof Date) {
        if (!deepEqual(oldValue, newValue)) {
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

export const deepFlatten = <T>(arr: (T | T[])[]): T[] =>
  ([] as T[]).concat(
    ...arr.map((v) => (Array.isArray(v) ? deepFlatten(v) : v)),
  );

/**
 * Deeply compares two values to determine if they are structurally equivalent.
 * Supports primitives, arrays, objects, and Date objects.
 */
export function deepEqual<T>(obj1: T, obj2: T): boolean {
  // 1. Strict equality check
  // Covers primitives (string, number, boolean) and identical references
  if (obj1 === obj2) {
    return true;
  }

  // 2. Filter out nulls and non-objects
  // (typeof null is 'object', so we must check strictly for null)
  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object'
  ) {
    return false;
  }

  // 3. Special handling for Date objects
  // Dates evaluate to empty objects {} when using Object.keys, so we must compare time values
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  // 4. Compare Arrays specifically (optional, but good for performance/clarity)
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }

  // 5. Compare Object Keys
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const obj1Record = obj1 as Record<string, unknown>;
  const obj2Record = obj2 as Record<string, unknown>;

  if (keys1.length !== keys2.length) {
    return false;
  }

  // 6. Recursive Comparison
  for (const key of keys1) {
    // Check if key exists in obj2 AND if values are deeply equal
    if (
      !Object.prototype.hasOwnProperty.call(obj2Record, key) ||
      !deepEqual(obj1Record[key], obj2Record[key])
    ) {
      return false;
    }
  }

  return true;
}
