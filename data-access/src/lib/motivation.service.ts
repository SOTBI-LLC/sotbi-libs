import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  AdjustmentWrapper,
  BaseCriteriaList,
  BaseCriteriaWrapper,
  CapHistory,
  CloseOperationWrapper,
  CoefficientCapWrapper,
  CreateBaseCriteriaRequest,
  DateOnlyString,
  IncludeUserRequest,
  OpenPeriodRequest,
  PayrollResultList,
  PerformanceSheetWrapper,
  PeriodSummaryList,
  PeriodWrapper,
  ReopenPeriodRequest,
  SavePerformanceSheetRequest,
  SetAdjustmentRequest,
  SetCoefficientCapRequest,
  SetCriterionScoreRequest,
  SheetCriterionWrapper,
  SheetSearchRequest,
  SheetSummaryList,
  UpdateBaseCriteriaRequest,
  Uuid,
} from '@sotbi/models';
import type { Observable } from 'rxjs';
import type { MotivationCommand } from './motivation-command';

/**
 * Typed HTTP client for the Motivation performance evaluation REST API
 * (`/api/motivation`). All mutations take an immutable
 * {@link MotivationCommand} whose key travels unchanged in the
 * `Idempotency-Key` header. The read-only sheet search never sends one.
 */
@Injectable({
  providedIn: 'root',
})
export class MotivationApiService {
  private readonly http = inject(HttpClient);
  private readonly basePath = '/api/motivation';

  private idempotencyHeaders(command: MotivationCommand<object>) {
    return { headers: { 'Idempotency-Key': command.key } };
  }

  // --- base criteria ---

  public listBaseCriteria(
    activeOn?: DateOnlyString,
  ): Observable<BaseCriteriaList> {
    const params = activeOn ? new HttpParams().set('activeOn', activeOn) : undefined;
    return this.http.get<BaseCriteriaList>(`${this.basePath}/base-criteria`, {
      params,
    });
  }

  public getBaseCriteria(criterionId: Uuid): Observable<BaseCriteriaWrapper> {
    return this.http.get<BaseCriteriaWrapper>(
      `${this.basePath}/base-criteria/${criterionId}`,
    );
  }

  public createBaseCriteria(
    command: MotivationCommand<CreateBaseCriteriaRequest>,
  ): Observable<BaseCriteriaWrapper> {
    return this.http.post<BaseCriteriaWrapper>(
      `${this.basePath}/base-criteria`,
      command.body,
      this.idempotencyHeaders(command),
    );
  }

  public updateBaseCriteria(
    criterionId: Uuid,
    command: MotivationCommand<UpdateBaseCriteriaRequest>,
  ): Observable<BaseCriteriaWrapper> {
    return this.http.patch<BaseCriteriaWrapper>(
      `${this.basePath}/base-criteria/${criterionId}`,
      command.body,
      {
        headers: {
          'Idempotency-Key': command.key,
          'Content-Type': 'application/merge-patch+json',
        },
      },
    );
  }

  // --- coefficient cap ---

  public getCoefficientCap(): Observable<CoefficientCapWrapper> {
    return this.http.get<CoefficientCapWrapper>(
      `${this.basePath}/coefficient-cap`,
    );
  }

  public listCoefficientCapHistory(): Observable<CapHistory> {
    return this.http.get<CapHistory>(`${this.basePath}/coefficient-cap/history`);
  }

  public setCoefficientCap(
    command: MotivationCommand<SetCoefficientCapRequest>,
  ): Observable<CoefficientCapWrapper> {
    return this.http.put<CoefficientCapWrapper>(
      `${this.basePath}/coefficient-cap`,
      command.body,
      this.idempotencyHeaders(command),
    );
  }

  // --- periods ---

  public listPeriods(): Observable<PeriodSummaryList> {
    return this.http.get<PeriodSummaryList>(`${this.basePath}/periods`);
  }

  public getPeriod(periodId: Uuid): Observable<PeriodWrapper> {
    return this.http.get<PeriodWrapper>(`${this.basePath}/periods/${periodId}`);
  }

  public openPeriod(
    command: MotivationCommand<OpenPeriodRequest>,
  ): Observable<PeriodWrapper> {
    return this.http.post<PeriodWrapper>(
      `${this.basePath}/periods`,
      command.body,
      this.idempotencyHeaders(command),
    );
  }

  public reopenPeriod(
    periodId: Uuid,
    command: MotivationCommand<ReopenPeriodRequest>,
  ): Observable<PeriodWrapper> {
    return this.http.post<PeriodWrapper>(
      `${this.basePath}/periods/${periodId}/reopen`,
      command.body,
      this.idempotencyHeaders(command),
    );
  }

  public includeUser(
    periodId: Uuid,
    command: MotivationCommand<IncludeUserRequest>,
  ): Observable<PerformanceSheetWrapper> {
    return this.http.post<PerformanceSheetWrapper>(
      `${this.basePath}/periods/${periodId}/users`,
      command.body,
      this.idempotencyHeaders(command),
    );
  }

  // --- payroll and close lifecycle ---

  public listPayrollResults(
    periodId: Uuid,
  ): Observable<PayrollResultList> {
    return this.http.get<PayrollResultList>(
      `${this.basePath}/periods/${periodId}/payroll-results`,
    );
  }

  public startClosePeriod(
    periodId: Uuid,
    command: MotivationCommand<Record<string, never>>,
  ): Observable<CloseOperationWrapper> {
    return this.http.post<CloseOperationWrapper>(
      `${this.basePath}/periods/${periodId}/close`,
      null,
      this.idempotencyHeaders(command),
    );
  }

  public getCloseOperation(
    operationId: Uuid,
  ): Observable<CloseOperationWrapper> {
    return this.http.get<CloseOperationWrapper>(
      `${this.basePath}/close-operations/${operationId}`,
    );
  }

  // --- performance sheets ---

  public getPerformanceSheet(
    sheetId: Uuid,
  ): Observable<PerformanceSheetWrapper> {
    return this.http.get<PerformanceSheetWrapper>(
      `${this.basePath}/performance-sheets/${sheetId}`,
    );
  }

  public savePerformanceSheet(
    sheetId: Uuid,
    command: MotivationCommand<SavePerformanceSheetRequest>,
  ): Observable<PerformanceSheetWrapper> {
    return this.http.post<PerformanceSheetWrapper>(
      `${this.basePath}/performance-sheets/${sheetId}/save`,
      command.body,
      this.idempotencyHeaders(command),
    );
  }

  public setCriterionScore(
    sheetId: Uuid,
    sheetCriterionId: Uuid,
    command: MotivationCommand<SetCriterionScoreRequest>,
  ): Observable<SheetCriterionWrapper> {
    return this.http.put<SheetCriterionWrapper>(
      `${this.basePath}/performance-sheets/${sheetId}/criteria/${sheetCriterionId}/score`,
      command.body,
      this.idempotencyHeaders(command),
    );
  }

  public setAdjustment(
    sheetId: Uuid,
    command: MotivationCommand<SetAdjustmentRequest>,
  ): Observable<AdjustmentWrapper> {
    return this.http.put<AdjustmentWrapper>(
      `${this.basePath}/performance-sheets/${sheetId}/adjustment`,
      command.body,
      this.idempotencyHeaders(command),
    );
  }

  /** Read-only search: absent `userIds` selects the full authorized scope; no idempotency key. */
  public searchPerformanceSheets(
    request: SheetSearchRequest,
  ): Observable<SheetSummaryList> {
    return this.http.post<SheetSummaryList>(
      `${this.basePath}/performance-sheets/search`,
      request,
    );
  }
}
