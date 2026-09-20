import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type {
  CreateBaseCriteriaRequest,
  PerformanceSheetWrapper,
  SavePerformanceSheetRequest,
} from '@sotbi/models';
import { of } from 'rxjs';
import { createMotivationCommand } from './motivation-command';
import { MotivationApiService } from './motivation.service';

const PERIOD_ID = '0b6c2f4e-1111-4222-8333-444455556666';
const SHEET_ID = 'a1b2c3d4-0000-4111-8222-333344445555';
const CRITERION_ID = 'b2c3d4e5-1111-4222-9333-444455556777';
const OPERATION_ID = 'c3d4e5f6-2222-4333-a444-555566667888';
const USER_ID = '9007199254740993'; // 2^53 + 1: exact only as a string.

const sheetWrapper: PerformanceSheetWrapper = {
  performanceSheet: {
    summary: {
      id: SHEET_ID,
      periodId: PERIOD_ID,
      userId: USER_ID,
      positionId: '12345678901234567890',
      isComplete: false,
      coefficient: { tenThousandths: 12550 },
      actions: {
        canEditScores: true,
        canEditAdjustment: true,
        requiresScoreComment: false,
      },
      employeeName: null,
      positionName: null,
    },
    criteria: [],
    adjustment: null,
  },
};

describe('MotivationApiService', () => {
  let service: MotivationApiService;
  let httpClient: jest.Mocked<HttpClient>;

  beforeEach(async () => {
    const httpSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    await TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpSpy }, MotivationApiService],
    }).compileComponents();

    service = TestBed.inject(MotivationApiService);
    httpClient = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('requests follow the OpenAPI paths', () => {
    it('lists periods and payroll results without legacy URLs', () => {
      httpClient.get.mockReturnValue(of({ items: [] }));

      service.listPeriods().subscribe();
      service.listPayrollResults(PERIOD_ID).subscribe();

      expect(httpClient.get).toHaveBeenCalledWith('/api/motivation/periods');
      expect(httpClient.get).toHaveBeenCalledWith(
        `/api/motivation/periods/${PERIOD_ID}/payroll-results`,
      );
    });

    it('searches sheets read-only: no Idempotency-Key is sent', () => {
      httpClient.post.mockReturnValue(of({ items: [] }));

      service
        .searchPerformanceSheets({ periodId: PERIOD_ID, userIds: [USER_ID] })
        .subscribe();

      expect(httpClient.post).toHaveBeenCalledTimes(1);
      const [url, body, options] = httpClient.post.mock.calls[0];
      expect(url).toBe('/api/motivation/performance-sheets/search');
      expect(body).toEqual({ periodId: PERIOD_ID, userIds: [USER_ID] });
      expect(options).toBeUndefined();
    });

    it('keeps the command key unchanged in the Idempotency-Key header', () => {
      httpClient.post.mockReturnValue(of(sheetWrapper));
      const command = createMotivationCommand<SavePerformanceSheetRequest>({
        scores: [{ sheetCriterionId: CRITERION_ID, score: 0 }],
      });

      service.savePerformanceSheet(SHEET_ID, command).subscribe();

      const [url, , options] = httpClient.post.mock.calls[0];
      expect(url).toBe(`/api/motivation/performance-sheets/${SHEET_ID}/save`);
      expect(
        (options as { headers: Record<string, string> }).headers[
          'Idempotency-Key'
        ],
      ).toBe(command.key);
    });

    it('sends the merge-patch content type for catalog PATCH', () => {
      httpClient.patch.mockReturnValue(
        of({
          baseCriteria: {
            id: CRITERION_ID,
            name: 'n',
            description: '',
            maxScore: 10,
            validFrom: '2026-01-01',
            validTo: null,
          },
        }),
      );
      const command = createMotivationCommand<{ validTo: null }>({
        validTo: null,
      });

      service.updateBaseCriteria(CRITERION_ID, command).subscribe();

      const [url, , options] = httpClient.patch.mock.calls[0];
      expect(url).toBe(`/api/motivation/base-criteria/${CRITERION_ID}`);
      expect(
        (options as { headers: Record<string, string> }).headers[
          'Content-Type'
        ],
      ).toBe('application/merge-patch+json');
    });

    it('starts close without a body but with the key', () => {
      httpClient.post.mockReturnValue(
        of({
          operation: {
            operationId: OPERATION_ID,
            periodId: PERIOD_ID,
            requesterUserId: USER_ID,
            state: 'queued',
            processedSheets: 0,
            totalSheets: 3,
            createdAt: '2026-09-17T10:00:00Z',
            startedAt: null,
            finishedAt: null,
            result: null,
            error: null,
          },
          pollUrl: `/api/motivation/close-operations/${OPERATION_ID}`,
        }),
      );
      const command = createMotivationCommand({});

      service.startClosePeriod(PERIOD_ID, command).subscribe();

      const [url, body, options] = httpClient.post.mock.calls[0];
      expect(url).toBe(`/api/motivation/periods/${PERIOD_ID}/close`);
      expect(body).toBeNull();
      expect(
        (options as { headers: Record<string, string> }).headers[
          'Idempotency-Key'
        ],
      ).toBe(command.key);
    });
  });

  describe('payload precision against the contract', () => {
    it('serializes external identifiers as exact decimal strings', () => {
      httpClient.post.mockReturnValue(of(sheetWrapper));
      const command = createMotivationCommand({
        userId: USER_ID,
      });

      service.includeUser(PERIOD_ID, command).subscribe();

      const [, body] = httpClient.post.mock.calls[0];
      expect(JSON.stringify(body)).toContain(USER_ID);
      expect(body).toEqual({ userId: USER_ID });
    });

    it('keeps absent properties absent: no null injection on save', () => {
      httpClient.post.mockReturnValue(of(sheetWrapper));
      const command = createMotivationCommand<SavePerformanceSheetRequest>({
        scores: [{ sheetCriterionId: CRITERION_ID, score: 0, comment: 'zero' }],
      });

      service.savePerformanceSheet(SHEET_ID, command).subscribe();

      const serialized = JSON.stringify(
        httpClient.post.mock.calls[0][1],
      ) as string;
      const parsed = JSON.parse(serialized) as Record<string, unknown>;
      expect(parsed).not.toHaveProperty('adjustment');
      expect(serialized).toContain('"score":0');
      expect(serialized).not.toContain('null');
    });

    it('does not normalize an absent userIds filter into an empty array', () => {
      httpClient.post.mockReturnValue(of({ items: [] }));

      service.searchPerformanceSheets({ periodId: PERIOD_ID }).subscribe();

      const [, body] = httpClient.post.mock.calls[0];
      expect(body).not.toHaveProperty('userIds');
      expect(JSON.stringify(body)).not.toContain('userIds');
    });

    it('distinguishes unset from zero when reading a sheet', () => {
      httpClient.get.mockReturnValue(
        of({
          performanceSheet: {
            ...sheetWrapper.performanceSheet,
            criteria: [
              {
                id: CRITERION_ID,
                periodCriterionId: CRITERION_ID,
                name: 'c1',
                description: '',
                maxScore: 10,
                score: null,
                history: [],
              },
              {
                id: OPERATION_ID,
                periodCriterionId: OPERATION_ID,
                name: 'c2',
                description: '',
                maxScore: 10,
                score: 0,
                history: [],
              },
            ],
          },
        }),
      );

      service.getPerformanceSheet(SHEET_ID).subscribe((wrapper) => {
        const criteria = wrapper.performanceSheet.criteria;
        expect(criteria[0].score).toBeNull();
        expect(criteria[1].score).toBe(0);
        expect(criteria[0].score === criteria[1].score).toBe(false);
      });
    });
  });

  describe('request fixtures for catalog creation', () => {
    it('creates a criterion with date-only strings and no validTo omission', () => {
      httpClient.post.mockReturnValue(
        of({
          baseCriteria: {
            id: CRITERION_ID,
            name: 'Качество',
            description: '',
            maxScore: 10,
            validFrom: '2026-09-01',
            validTo: null,
          },
        }),
      );
      const payload: CreateBaseCriteriaRequest = {
        name: 'Качество',
        maxScore: 10,
        validFrom: '2026-09-01',
      };
      const command = createMotivationCommand(payload);

      service.createBaseCriteria(command).subscribe();

      const [, body] = httpClient.post.mock.calls[0];
      expect(body).not.toHaveProperty('validTo');
      expect((body as CreateBaseCriteriaRequest).validFrom).toBe('2026-09-01');
    });
  });
});
