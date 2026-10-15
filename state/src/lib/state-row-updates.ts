interface EditableRow {
  id: number;
  dirty: boolean;
}

let nextDraftId = -1;

/** Give unsaved rows an identity which survives immutable edits and reordering. */
export function assignDraftIds<T extends EditableRow>(rows: readonly T[]): T[] {
  nextDraftId = Math.min(
    nextDraftId,
    rows.reduce((minimum, row) => Math.min(minimum, row.id), 0) - 1,
  );
  return rows.map((row) =>
    row.id === 0 ? { ...row, id: nextDraftId-- } : row,
  );
}

/** Merge confirmed values while retaining edits made after submission. */
export function mergeSavedRows<T extends EditableRow>(input: {
  items: readonly T[];
  allItems: readonly T[];
  pending: readonly T[];
  results: readonly T[];
}): { items: T[]; allItems: T[] } {
  const items = [...input.items];
  const allItems = [...input.allItems];
  input.results.forEach((result, responseIndex) => {
    const submitted = input.pending[responseIndex];
    const confirmed = { ...result, dirty: false };
    const index = submitted
      ? items.findIndex((item) => item.id === submitted.id)
      : -1;
    if (index >= 0) {
      items[index] =
        items[index] === submitted
          ? confirmed
          : { ...items[index], id: result.id, dirty: true };
    }
    const allIndex = allItems.findIndex((item) => item.id === confirmed.id);
    if (allIndex >= 0) {
      allItems[allIndex] = confirmed;
    } else {
      allItems.push(confirmed);
    }
  });
  return { items, allItems };
}
