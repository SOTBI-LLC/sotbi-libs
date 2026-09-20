import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type {
  PerformanceSheet,
  PerformanceSheetSummary,
  Period,
  PeriodSummary,
} from '@sotbi/models';
import { Subject, type Observable } from 'rxjs';
import { MotivationApiService } from '@sotbi/data-access';
import { MotivationServerState } from './motivation-server-state';

const PERIOD_ID = '0b6c2f4e-1111-4222-8333-444455556666';
const SHEET_A = 'a1b2c3d4-0000-4111-8222-333344445555';
const SHEET_B = 'b2c3d4e5-1111-4222-9333-444455556777';
const USER_A = '10000000000000000001';
const USER_B = '10000000000000000002';

function makeSheet(sheetId: string, coefficient: number): PerformanceSheet {
  return {
    summary: {
      id: sheetId,
      periodId: PERIOD_ID,
      userId: USER_A,
      positionId: '42',
      isComplete: true,
      coefficient: { tenThousandths: coefficient },
      actions: {
        canEditScores: false,
        canEditAdjustment: false,
        requiresScoreComment: false,
      },
      employeeName: null,
      positionName: null,
    },
    criteria: [],
    adjustment: null,
  };
}

function makeSummary(sheetId: string): PerformanceSheetSummary {
  return {
    id: sheetId,
    periodId: PERIOD_ID,
    userId: USER_A,
    positionId: '42',
    isComplete: true,
    coefficient: { tenThousandths: 10000 },
    actions: {
      canEditScores: false,
      canEditAdjustment: false,
      requiresScoreComment: false,
    },
    employeeName: null,
    positionName: null,
  };
}

function makePeriodSummary(): PeriodSummary {
  return {
    id: PERIOD_ID,
    year: 2026,
    month: 9,
    startsAt: '2026-09-01',
    endsAt: '2026-09-30',
    status: 'open',
    effectiveCap: { tenThousandths: 30000 },
    totalSheets: 5,
    completeSheets: 1,
  };
}

function makePeriod(): Period {
  return {
    summary: makePeriodSummary(),
    criteria: [],
    stampedCap: null,
    latestReopenReason: null,
  };
}

/** Observable that only emits when the test flushes it. */
function deferred<T>(value: T): { source: Observable<T>; flush: () => void } {
  const subject = new Subject<T>();
  return {
    source: subject.asObservable(),
    flush: () => {
      subject.next(value);
      subject.complete();
    },
  };
}

describe('MotivationServerState', () => {
  let state: MotivationServerState;
  let api: jest.Mocked<MotivationApiService>;

  beforeEach(async () => {
    const apiSpy = {
      listPeriods: jest.fn(),
      getPeriod: jest.fn(),
      getPerformanceSheet: jest.fn(),
      searchPerformanceSheets: jest.fn(),
    } as unknown as jest.Mocked<MotivationApiService>;

    await TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: MotivationApiService, useValue: apiSpy },
        MotivationServerState,
      ],
    }).compileComponents();

    state = TestBed.inject(MotivationServerState);
    api = TestBed.inject(
      MotivationApiService,
    ) as jest.Mocked<MotivationApiService>;
  });

  describe('effective-user scoping', () => {
    it('drops pending responses of the previous user and clears caches', () => {
      state.setEffectiveUser(USER_A);

      const first = deferred({ items: [makePeriodSummary()] });
      api.listPeriods.mockReturnValueOnce(first.source);
      state.loadPeriods();
      expect(state.periods()?.data).toBeNull();

      state.setEffectiveUser(USER_B);
      first.flush();

      expect(state.periods()?.data).toBeNull();
      expect(state.periods()?.loading).toBe(false);
    });

    it('keeps another user from seeing cached results of the first', () => {
      state.setEffectiveUser(USER_A);
      const sheet = deferred({ performanceSheet: makeSheet(SHEET_A, 12550) });
      api.getPerformanceSheet.mockReturnValueOnce(sheet.source);
      state.loadSheet(SHEET_A);
      sheet.flush();
      expect(state.sheetOf(SHEET_A)?.data?.summary.coefficient).toEqual({
        tenThousandths: 12550,
      });

      state.setEffectiveUser(USER_B);
      expect(state.sheetOf(SHEET_A)?.data).toBeNull();
    });

    it('keeps the scope when the same user is set again', () => {
      state.setEffectiveUser(USER_A);
      const sheet = deferred({ performanceSheet: makeSheet(SHEET_A, 10000) });
      api.getPerformanceSheet.mockReturnValueOnce(sheet.source);
      state.loadSheet(SHEET_A);
      sheet.flush();

      state.setEffectiveUser(USER_A);
      expect(state.sheetOf(SHEET_A)?.data).not.toBeNull();
    });
  });

  describe('stale loads', () => {
    it('applies only the latest load for the same sheet', () => {
      state.setEffectiveUser(USER_A);

      const older = deferred({ performanceSheet: makeSheet(SHEET_A, 1) });
      const newer = deferred({ performanceSheet: makeSheet(SHEET_A, 2) });
      api.getPerformanceSheet
        .mockReturnValueOnce(older.source)
        .mockReturnValueOnce(newer.source);

      state.loadSheet(SHEET_A);
      state.loadSheet(SHEET_A);
      older.flush();
      // The superseded read was cancelled; it must not populate the cache.
      expect(state.sheetOf(SHEET_A)?.data).toBeNull();

      newer.flush();
      expect(state.sheetOf(SHEET_A)?.data?.summary.coefficient).toEqual({
        tenThousandths: 2,
      });
      expect(state.sheetOf(SHEET_A)?.loading).toBe(false);
    });
  });

  describe('save adoption', () => {
    it('stores the committed sheet and invalidates summaries, period and sheet list', () => {
      state.setEffectiveUser(USER_A);

      const periodList = deferred({ items: [makePeriodSummary()] });
      api.listPeriods.mockReturnValueOnce(periodList.source);
      state.loadPeriods();
      periodList.flush();
      expect(state.periods()?.data?.items).toHaveLength(1);

      const period = deferred({ period: makePeriod() });
      api.getPeriod.mockReturnValueOnce(period.source);
      state.loadPeriod(PERIOD_ID);
      period.flush();

      const summaries = deferred({ items: [makeSummary(SHEET_A)] });
      api.searchPerformanceSheets.mockReturnValueOnce(summaries.source);
      state.loadSheetSummaries(PERIOD_ID);
      summaries.flush();

      const committed: PerformanceSheet = makeSheet(SHEET_A, 12550);
      state.adoptSheet({ performanceSheet: committed });

      expect(state.sheetOf(SHEET_A)?.data?.summary.coefficient).toEqual({
        tenThousandths: 12550,
      });
      // Invalidated server views stay empty until explicitly reloaded.
      expect(state.periods()?.data).toBeNull();
      expect(state.periodOf(PERIOD_ID)?.data).toBeNull();
      expect(state.sheetSummariesOf(PERIOD_ID)?.data).toBeNull();
    });

    it('never lets an in-flight read overwrite an adopted result', () => {
      state.setEffectiveUser(USER_A);

      const staleRead = deferred({ performanceSheet: makeSheet(SHEET_A, 1) });
      api.getPerformanceSheet.mockReturnValueOnce(staleRead.source);
      state.loadSheet(SHEET_A);

      state.adoptSheet({ performanceSheet: makeSheet(SHEET_A, 12550) });
      staleRead.flush();

      expect(state.sheetOf(SHEET_A)?.data?.summary.coefficient).toEqual({
        tenThousandths: 12550,
      });
    });

    it('ignores adoption of a sheet belonging to another scope', () => {
      state.setEffectiveUser(USER_A);
      state.adoptSheet({ performanceSheet: makeSheet(SHEET_A, 12550) });
      expect(state.sheetOf(SHEET_A)?.data?.summary.coefficient).toEqual({
        tenThousandths: 12550,
      });

      state.setEffectiveUser(USER_B);
      expect(state.sheetOf(SHEET_A)?.data).toBeNull();
    });
  });

  describe('explicit sheet switch', () => {
    it('cancels the previous in-flight sheet load when a new sheet opens', () => {
      state.setEffectiveUser(USER_A);

      const first = deferred({ performanceSheet: makeSheet(SHEET_A, 1) });
      const second = deferred({ performanceSheet: makeSheet(SHEET_B, 2) });
      api.getPerformanceSheet
        .mockReturnValueOnce(first.source)
        .mockReturnValueOnce(second.source);
      state.loadSheet(SHEET_A);

      state.loadSheet(SHEET_B);
      first.flush();

      expect(state.sheetOf(SHEET_A)?.data).toBeNull();
      expect(state.sheetOf(SHEET_A)?.loading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('records load errors without throwing and clears loading', () => {
      state.setEffectiveUser(USER_A);

      const subject = new Subject<{ items: PeriodSummary[] }>();
      api.listPeriods.mockReturnValueOnce(subject.asObservable());
      state.loadPeriods();
      subject.error(new Error('boom'));

      expect(state.periods()?.loading).toBe(false);
      expect(state.periods()?.error).toBeInstanceOf(Error);
      expect(state.periods()?.data).toBeNull();
    });
  });
});
