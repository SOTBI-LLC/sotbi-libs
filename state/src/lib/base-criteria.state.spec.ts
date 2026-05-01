import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { BaseCriteriaService } from '@sotbi/data-access';
import { BaseCriteria } from '@sotbi/models';
import { of } from 'rxjs';
import {
  BaseCriteriaAddAction,
  BaseCriteriaGetActions,
  BaseCriteriaPutAction,
} from './base-criteria.actions';
import { BaseCriteriaState } from './base-criteria.state';

function createBaseCriterion(
  partial: Partial<BaseCriteria> = {},
): BaseCriteria {
  const validFrom = new Date();
  const validTo = new Date();
  return new BaseCriteria({
    id: 1,
    name: 'item-1',
    description: 'item-1',
    max_score: 10,
    valid_from: validFrom,
    valid_to: validTo,
    ...partial,
  });
}

describe('BaseCriteria store', () => {
  let store: Store;
  let baseCriteriaService: jest.Mocked<BaseCriteriaService>;

  beforeEach(async () => {
    const serviceSpy = {
      add: jest.fn(),
      GetAll: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<BaseCriteriaService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: BaseCriteriaService, useValue: serviceSpy },
        provideStore([BaseCriteriaState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    baseCriteriaService = TestBed.inject(
      BaseCriteriaService,
    ) as jest.Mocked<BaseCriteriaService>;
  });

  it('should create an action and add an item', async () => {
    const criterion = createBaseCriterion();

    baseCriteriaService.add.mockReturnValue(of(criterion));
    await store.dispatch(new BaseCriteriaAddAction(criterion));

    expect(store.selectSnapshot(BaseCriteriaState.getItems)).toEqual([
      criterion,
    ]);
    expect(store.selectSnapshot(BaseCriteriaState.getLoading)).toBe(false);
  });

  it('should fetch items when get is dispatched and the store is empty', async () => {
    const c1 = createBaseCriterion({ id: 1, name: 'a' });
    const c2 = createBaseCriterion({ id: 2, name: 'b' });

    baseCriteriaService.GetAll.mockReturnValue(of([c1, c2]));
    await store.dispatch(new BaseCriteriaGetActions());

    expect(baseCriteriaService.GetAll).toHaveBeenCalledTimes(1);
    expect(store.selectSnapshot(BaseCriteriaState.getItems)).toEqual([c1, c2]);
    expect(store.selectSnapshot(BaseCriteriaState.getLoading)).toBe(false);
  });

  it('should not call GetAll when get is dispatched and items are already cached', async () => {
    const c1 = createBaseCriterion();

    baseCriteriaService.GetAll.mockReturnValue(of([c1]));
    await store.dispatch(new BaseCriteriaGetActions());

    baseCriteriaService.GetAll.mockClear();
    await store.dispatch(new BaseCriteriaGetActions());

    expect(baseCriteriaService.GetAll).not.toHaveBeenCalled();
    expect(store.selectSnapshot(BaseCriteriaState.getItems)).toEqual([c1]);
    expect(store.selectSnapshot(BaseCriteriaState.getLoading)).toBe(false);
  });

  it('should append the item returned from update after put', async () => {
    const existing = createBaseCriterion({ id: 1, name: 'before' });
    const updated = createBaseCriterion({
      id: 1,
      name: 'after',
      description: 'after',
    });

    baseCriteriaService.GetAll.mockReturnValue(of([existing]));
    await store.dispatch(new BaseCriteriaGetActions());

    baseCriteriaService.update.mockReturnValue(of(updated));
    await store.dispatch(new BaseCriteriaPutAction(updated));

    expect(baseCriteriaService.update).toHaveBeenCalledWith(updated);
    expect(store.selectSnapshot(BaseCriteriaState.getItems)).toEqual([
      existing,
      updated,
    ]);
    expect(store.selectSnapshot(BaseCriteriaState.getLoading)).toBe(false);
  });
});
