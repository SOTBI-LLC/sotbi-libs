import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { UserPerformance } from '@sotbi/models';
import { UserPerformanceService } from 'data-access/src/lib/motivation.service';
import { of } from 'rxjs';
import { UserPerformanceUpsertAction } from './user-performance.actions';
import type { UserPerformanceStateModel } from './user-performance.state';
import { UserPerformanceState } from './user-performance.state';

describe('UserPerformance store', () => {
  let store: Store;
  let userPerformanceService: jest.Mocked<UserPerformanceService>;

  beforeEach(async () => {
    const serviceSpy = {
      upsert: jest.fn(),
      getAll: jest.fn(),
    } as unknown as jest.Mocked<UserPerformanceService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserPerformanceService, useValue: serviceSpy },
        provideStore([UserPerformanceState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    userPerformanceService = TestBed.inject(
      UserPerformanceService,
    ) as jest.Mocked<UserPerformanceService>;
  });

  it('should create an action and add an item', async () => {
    const evaluatedAt = new Date();
    const performance = new UserPerformance({
      id: 1,
      user_id: 1,
      staff_id: 1,
      criteria_id: 1,
      earned_score: 10,
      comment: 'item-1',
      evaluated_at: evaluatedAt,
      evaluated_by: 0,
    });

    const expected: UserPerformanceStateModel = {
      loading: false,
      items: [performance],
      selectedPeriod: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
      },
    };

    userPerformanceService.upsert.mockReturnValue(of(performance));
    await store.dispatch(new UserPerformanceUpsertAction(performance));

    expect(store.selectSnapshot(UserPerformanceState.getItems)).toEqual(
      expected.items,
    );
    expect(store.selectSnapshot(UserPerformanceState.getLoading)).toEqual(
      expected.loading,
    );
  });
});
