import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PerformancePeriodService } from '@sotbi/data-access';
import { provideStore, Store } from '@ngxs/store';
import { PerformancePeriod } from '@sotbi/models';
import { PerformancePeriodAction } from './performance-period.actions';
import type { PerformancePeriodStateModel } from './performance-period.state';
import { PerformancePeriodState } from './performance-period.state';

describe('PerformancePeriod store', () => {
  let store: Store;
  let performancePeriodService: jest.Mocked<PerformancePeriodService>;

  beforeEach(async () => {
    const serviceSpy = {
      add: jest.fn(),
    } as unknown as jest.Mocked<PerformancePeriodService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PerformancePeriodService, useValue: serviceSpy },
        provideStore([PerformancePeriodState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    performancePeriodService =
      TestBed.inject(PerformancePeriodService) as jest.Mocked<PerformancePeriodService>;
  });

  it('should create an action and add an item', async () => {
    const startDate = new Date();
    const endDate = new Date();
    const performancePeriod = new PerformancePeriod({
      year: 2026,
      month: 1,
      is_active: false,
      starts_at: startDate,
      ends_at: endDate,
    });

    const expected: PerformancePeriodStateModel = {
      loading: false,
      items: [
        new PerformancePeriod({
          year: 2026,
          month: 1,
          is_active: false,
          starts_at: startDate,
          ends_at: endDate,
        }),
      ],
    };

    performancePeriodService.add.mockReturnValue(of(performancePeriod));
    await store.dispatch(new PerformancePeriodAction(performancePeriod));

    const actual = store.selectSnapshot(PerformancePeriodState.getState);
    expect(actual).toEqual(expected);
  });
});
