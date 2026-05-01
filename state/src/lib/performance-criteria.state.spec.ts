import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { PerformanceCriteriaService } from '@sotbi/data-access';
import { PerformanceCriteria } from '@sotbi/models';
import { of } from 'rxjs';
import {
  PerformanceCriteriaAddAction,
  PerformanceCriteriaGetActions,
  PerformanceCriteriaPutAction,
} from './performance-criteria.actions';
import { PerformanceCriteriaState } from './performance-criteria.state';

function createCriterion(
  partial: Partial<PerformanceCriteria> = {},
): PerformanceCriteria {
  const validFrom = new Date();
  const validTo = new Date();
  return new PerformanceCriteria({
    id: 1,
    name: 'item-1',
    description: 'item-1',
    max_score: 10,
    is_absolute: false,
    valid_from: validFrom,
    valid_to: validTo,
    ...partial,
  });
}

describe('PerformanceCriteria store', () => {
  let store: Store;
  let performanceCriteriaService: jest.Mocked<PerformanceCriteriaService>;

  beforeEach(async () => {
    const serviceSpy = {
      add: jest.fn(),
      GetAll: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<PerformanceCriteriaService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PerformanceCriteriaService, useValue: serviceSpy },
        provideStore([PerformanceCriteriaState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    performanceCriteriaService = TestBed.inject(
      PerformanceCriteriaService,
    ) as jest.Mocked<PerformanceCriteriaService>;
  });

  it('should create an action and add an item', async () => {
    const criterion = createCriterion();

    performanceCriteriaService.add.mockReturnValue(of(criterion));
    await store.dispatch(new PerformanceCriteriaAddAction(criterion));

    const actual = store.selectSnapshot(PerformanceCriteriaState.getItems);
    expect(actual).toEqual([criterion]);
    const loading = store.selectSnapshot(PerformanceCriteriaState.getLoading);
    expect(loading).toBe(false);
  });

  it('should fetch items when get is dispatched and the store is empty', async () => {
    const c1 = createCriterion({ id: 1, name: 'a' });
    const c2 = createCriterion({ id: 2, name: 'b' });

    performanceCriteriaService.GetAll.mockReturnValue(of([c1, c2]));
    await store.dispatch(new PerformanceCriteriaGetActions());

    expect(performanceCriteriaService.GetAll).toHaveBeenCalledTimes(1);
    expect(store.selectSnapshot(PerformanceCriteriaState.getItems)).toEqual([
      c1,
      c2,
    ]);
    expect(store.selectSnapshot(PerformanceCriteriaState.getLoading)).toBe(
      false,
    );
  });

  it('should not call GetAll when get is dispatched and items are already cached', async () => {
    const c1 = createCriterion();

    performanceCriteriaService.GetAll.mockReturnValue(of([c1]));
    await store.dispatch(new PerformanceCriteriaGetActions());

    performanceCriteriaService.GetAll.mockClear();
    await store.dispatch(new PerformanceCriteriaGetActions());

    expect(performanceCriteriaService.GetAll).not.toHaveBeenCalled();
    expect(store.selectSnapshot(PerformanceCriteriaState.getItems)).toEqual([
      c1,
    ]);
    expect(store.selectSnapshot(PerformanceCriteriaState.getLoading)).toBe(
      false,
    );
  });

  it('should append the item returned from update after put', async () => {
    const existing = createCriterion({ id: 1, name: 'before' });
    const updated = createCriterion({
      id: 1,
      name: 'after',
      description: 'after',
    });

    performanceCriteriaService.GetAll.mockReturnValue(of([existing]));
    await store.dispatch(new PerformanceCriteriaGetActions());

    performanceCriteriaService.update.mockReturnValue(of(updated));
    await store.dispatch(new PerformanceCriteriaPutAction(updated));

    expect(performanceCriteriaService.update).toHaveBeenCalledWith(updated);
    expect(store.selectSnapshot(PerformanceCriteriaState.getItems)).toEqual([
      existing,
      updated,
    ]);
    expect(store.selectSnapshot(PerformanceCriteriaState.getLoading)).toBe(
      false,
    );
  });
});
