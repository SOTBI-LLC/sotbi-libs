import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { PerformanceCriteria } from '@sotbi/models';
import { PerformanceCriteriaAction } from './performance-criteria.actions';
import type { PerformanceCriteriaStateModel } from './performance-criteria.state';
import { PerformanceCriteriaState } from './performance-criteria.state';

describe('PerformanceCriteria store', () => {
  let store: Store;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([PerformanceCriteriaState])],
    });

    store = TestBed.inject(Store);
  });

  it('should create an action and add an item', () => {
    const expected: PerformanceCriteriaStateModel = {
      items: [
        new PerformanceCriteria({
          id: 1,
          name: 'item-1',
          description: 'item-1',
          max_score: 10,
          is_absolute: false,
          valid_from: new Date(),
          valid_to: new Date(),
        }),
      ],
      loading: false,
    };
    store.dispatch(
      new PerformanceCriteriaAction(
        new PerformanceCriteria({
          id: 1,
          name: 'item-1',
          description: 'item-1',
          max_score: 10,
          is_absolute: false,
          valid_from: new Date(),
          valid_to: new Date(),
        }),
      ),
    );
    const actual = store.selectSnapshot(PerformanceCriteriaState.getState);
    expect(actual).toEqual(expected);
  });
});
