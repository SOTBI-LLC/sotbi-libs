import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { UserPerformance } from '@sotbi/models';
import { UserPerformanceAction } from './user-performance.actions';
import type { UserPerformanceStateModel } from './user-performance.state';
import { UserPerformanceState } from './user-performance.state';

describe('UserPerformance store', () => {
  let store: Store;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([UserPerformanceState])],
    });

    store = TestBed.inject(Store);
  });

  it('should create an action and add an item', () => {
    const expected: UserPerformanceStateModel = {
      items: [
        new UserPerformance({
          id: 1,
          user_id: 1,
          staff_id: 1,
          criteria_id: 1,
          earned_score: 10,
          comment: 'item-1',
        }),
      ],
    };
    store.dispatch(
      new UserPerformanceAction(
        new UserPerformance({
          id: 1,
          user_id: 1,
          staff_id: 1,
          criteria_id: 1,
          earned_score: 10,
          comment: 'item-1',
        }),
      ),
    );
    const actual = store.selectSnapshot(UserPerformanceState.getState);
    expect(actual).toEqual(expected);
  });
});
