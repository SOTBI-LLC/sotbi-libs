import { assignDraftIds, mergeSavedRows } from './state-row-updates';

describe('pending row responses', () => {
  it('does not reuse a removed draft identity for a subsequent request', () => {
    const [first] = assignDraftIds<{ id: number; dirty: boolean }>([
      { id: 0, dirty: true },
    ]);
    const [second] = assignDraftIds<{ id: number; dirty: boolean }>([
      { id: 0, dirty: true },
    ]);
    const merged = mergeSavedRows({
      items: [second],
      allItems: [],
      pending: [first],
      results: [{ id: 10, dirty: false }],
    });
    expect(second.id).not.toBe(first.id);
    expect(merged.items).toEqual([second]);
  });
  it('keeps a newer edit after a row moves during an update', () => {
    const submitted = { id: 1, dirty: true, name: 'submitted' };
    const edited = { ...submitted, name: 'newer' };
    const other = { id: 2, dirty: false, name: 'other' };
    const merged = mergeSavedRows({
      items: [other, edited],
      allItems: [],
      pending: [submitted],
      results: [{ ...submitted, dirty: false }],
    });
    expect(merged.items).toEqual([other, edited]);
    expect(merged.allItems).toEqual([{ ...submitted, dirty: false }]);
  });
});
