import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { BaseCriteria } from '@sotbi/models';
import { BaseCriteriaAction } from './base-criteria.actions';
import type { BaseCriteriaStateModel } from './base-criteria.state';
import { BaseCriteriaState } from './base-criteria.state';

describe('BaseCriteria store', () => {
  let store: Store;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([BaseCriteriaState])],
    });

    store = TestBed.inject(Store);
  });

  it('should create an action and add an item', () => {
    const expected: BaseCriteriaStateModel = {
      items: [
        new BaseCriteria({
          id: 1,
          name: 'item-1',
          description: 'item-1',
          max_score: 10,
          valid_from: new Date(),
          valid_to: new Date(),
        }),
      ],
      loading: false,
    };
    store.dispatch(
      new BaseCriteriaAction(
        new BaseCriteria({
          id: 1,
          name: 'item-1',
          description: 'item-1',
          max_score: 10,
          valid_from: new Date(),
          valid_to: new Date(),
        }),
      ),
    );
    const actual = store.selectSnapshot(BaseCriteriaState.getState);
    expect(actual).toEqual(expected);
  });
});
