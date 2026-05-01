import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { PerformancePeriodService } from '@sotbi/data-access';
import { PerformancePeriod } from '@sotbi/models';
import { of } from 'rxjs';
import {
  PerformancePeriodGetActions,
  PerformancePeriodPutAction,
} from './performance-period.actions';
import type { PerformancePeriodStateModel } from './performance-period.state';
import { PerformancePeriodState } from './performance-period.state';

function createPeriod(
  partial: Partial<PerformancePeriod> = {},
): PerformancePeriod {
  const startsAt = new Date();
  const endsAt = new Date();
  return new PerformancePeriod({
    year: 2026,
    month: 1,
    is_active: false,
    starts_at: startsAt,
    ends_at: endsAt,
    ...partial,
  });
}

describe('PerformancePeriod store', () => {
  let store: Store;
  let performancePeriodService: jest.Mocked<PerformancePeriodService>;

  beforeEach(async () => {
    const serviceSpy = {
      update: jest.fn(),
      GetAll: jest.fn(),
    } as unknown as jest.Mocked<PerformancePeriodService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PerformancePeriodService, useValue: serviceSpy },
        provideStore([PerformancePeriodState]),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    performancePeriodService = TestBed.inject(
      PerformancePeriodService,
    ) as jest.Mocked<PerformancePeriodService>;
  });

  it('should load periods when get is dispatched', async () => {
    const p1 = createPeriod({ year: 2026, month: 1 });
    const p2 = createPeriod({ year: 2026, month: 2 });

    performancePeriodService.GetAll.mockReturnValue(of([p1, p2]));
    await store.dispatch(new PerformancePeriodGetActions());

    expect(performancePeriodService.GetAll).toHaveBeenCalledTimes(1);
    const actual = store.selectSnapshot(PerformancePeriodState.getState);
    expect(actual).toEqual({
      loading: false,
      items: [p1, p2],
    } satisfies PerformancePeriodStateModel);

    // should not call GetAll again if items are already cached
    await store.dispatch(new PerformancePeriodGetActions());
    await store.dispatch(new PerformancePeriodGetActions());
    expect(performancePeriodService.GetAll).toHaveBeenCalledTimes(1);
  });

  it('should append a new period after put when year/month is not in state', async () => {
    const performancePeriod = createPeriod();

    const expected: PerformancePeriodStateModel = {
      loading: false,
      items: [performancePeriod],
    };

    performancePeriodService.update.mockReturnValue(of(performancePeriod));
    await store.dispatch(new PerformancePeriodPutAction(performancePeriod));

    const actual = store.selectSnapshot(PerformancePeriodState.getState);
    expect(actual).toEqual(expected);
  });

  it('should replace a period after put when year and month already exist', async () => {
    const startDate = new Date();
    const endDate = new Date();
    const existing = createPeriod({
      year: 2026,
      month: 3,
      is_active: false,
      starts_at: startDate,
      ends_at: endDate,
    });
    const updated = createPeriod({
      year: 2026,
      month: 3,
      is_active: true,
      starts_at: startDate,
      ends_at: endDate,
    });

    performancePeriodService.GetAll.mockReturnValue(of([existing]));
    await store.dispatch(new PerformancePeriodGetActions());

    performancePeriodService.update.mockReturnValue(of(updated));
    await store.dispatch(new PerformancePeriodPutAction(updated));

    const actual = store.selectSnapshot(PerformancePeriodState.getState);
    expect(actual).toEqual({
      loading: false,
      items: [updated],
    } satisfies PerformancePeriodStateModel);
  });
});
