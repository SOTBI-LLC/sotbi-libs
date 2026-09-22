/**
 * Wire DTOs for the Motivation performance evaluation REST API
 * (`sotbisrv/api/openapi/motivation.yaml`, base path `/api/motivation`).
 *
 * Contract invariants mirrored here:
 * - external identifiers (user, position, actor, requester) are decimal
 *   strings (`DecimalInt64`) so values beyond 2^53 survive untouched;
 * - resource ids are canonical UUID strings;
 * - date-only values are `YYYY-MM-DD` strings and never round-trip through `Date`;
 * - audit instants are RFC 3339 UTC timestamp strings;
 * - nullable cells (`null`) stay distinct from explicit `0`.
 */

/** Canonical lowercase UUID v4 (resource identifiers). */
export type Uuid = string;

/** Positive 64-bit integer as a decimal string; exact above 2^53. */
export type DecimalInt64 = string;

/** Calendar date `YYYY-MM-DD`; no timezone semantics. */
export type DateOnlyString = string;

/** RFC 3339 UTC instant. */
export type TimestampString = string;

/** Exact coefficient: unsigned integer count of ten-thousandths (`30000` = `3.0000`). */
export interface Coefficient {
  tenThousandths: number;
}

export type PeriodStatus = 'open' | 'closing' | 'closed';

export type CloseOperationState = 'queued' | 'running' | 'succeeded' | 'failed';

// --- Base criteria (catalog) ---

export interface BaseCriteria {
  id: Uuid;
  name: string;
  description: string;
  /** Signed int32, minimum 1. */
  maxScore: number;
  validFrom: DateOnlyString;
  /** `null` means the validity end is not set (inclusive validity). */
  validTo: DateOnlyString | null;
}

export interface BaseCriteriaWrapper {
  baseCriteria: BaseCriteria;
}

export interface BaseCriteriaList {
  items: BaseCriteria[];
}

export interface CreateBaseCriteriaRequest {
  name: string;
  description?: string;
  maxScore: number;
  validFrom: DateOnlyString;
  validTo?: DateOnlyString | null;
}

/**
 * Merge-PATCH payload: only present properties update, `validTo: null`
 * clears the validity end. An empty object is rejected by the server.
 */
export interface UpdateBaseCriteriaRequest {
  name?: string;
  description?: string;
  maxScore?: number;
  validFrom?: DateOnlyString;
  validTo?: DateOnlyString | null;
}

// --- Coefficient cap ---

export interface CoefficientCapWrapper {
  coefficientCap: Coefficient;
}

export interface SetCoefficientCapRequest {
  /** Unsigned, minimum 1. */
  tenThousandths: number;
  /** Optional audit text; omission and empty string are equivalent. */
  comment?: string;
}

/** Durable audit coverage starts at this baseline; earlier changes are unavailable. */
export interface CapHistoryBaseline {
  coefficientCap: Coefficient;
  recordedAt: TimestampString;
}

export interface CapHistoryEntry {
  id: Uuid;
  actorUserId: DecimalInt64;
  recordedAt: TimestampString;
  previousCap: Coefficient;
  newCap: Coefficient;
  comment: string;
}

export interface CapHistory {
  baseline: CapHistoryBaseline;
  earlierHistoryUnavailable: true;
  /** Accepted saves in reverse committed order. */
  entries: CapHistoryEntry[];
}

// --- Periods ---

/** Frozen criterion of one period, ordered by name then identifier. */
export interface PeriodCriterion {
  id: Uuid;
  baseCriteriaId: Uuid;
  name: string;
  description: string;
  /** Signed int32, minimum 1. */
  maxScore: number;
}

export interface PeriodSummary {
  id: Uuid;
  year: number;
  month: number;
  startsAt: DateOnlyString;
  endsAt: DateOnlyString;
  status: PeriodStatus;
  effectiveCap: Coefficient;
  totalSheets: number;
  completeSheets: number;
}

export interface PeriodSummaryList {
  items: PeriodSummary[];
}

export interface Period {
  summary: PeriodSummary;
  criteria: PeriodCriterion[];
  /** `null` while the period has not committed a close; otherwise the stamped cap. */
  stampedCap: Coefficient | null;
  latestReopenReason: string | null;
}

export interface PeriodWrapper {
  period: Period;
}

export interface OpenPeriodRequest {
  year: number;
  month: number;
}

export interface ReopenPeriodRequest {
  reason: string;
}

export interface IncludeUserRequest {
  userId: DecimalInt64;
}

// --- Performance sheets ---

/** One committed history entry; ordered list is the authoritative event order. */
export interface ScoreChange {
  id: Uuid;
  actorUserId: DecimalInt64;
  /** Current display name resolved by the gateway; the identifier stays authoritative. */
  actorName: string | null;
  changedAt: TimestampString;
  /** `null` for the first recorded value. */
  from: number | null;
  to: number;
  comment: string;
}

/** `score: null` means not assessed; `0` is a recorded zero. */
export interface SheetCriterion {
  id: Uuid;
  periodCriterionId: Uuid;
  name: string;
  description: string;
  maxScore: number;
  score: number | null;
  history: ScoreChange[];
}

export interface SheetCriterionWrapper {
  sheetCriterion: SheetCriterion;
}

/** `null` adjustment means none recorded; a present adjustment is an object (zero included). */
export interface Adjustment {
  value: number;
  history: ScoreChange[];
}

export interface AdjustmentWrapper {
  adjustment: Adjustment;
}

/**
 * Server-derived edit projection for the authenticated principal at response
 * time. A UI hint, never a write credential; a replayed idempotent response
 * may carry stale hints.
 */
export interface SheetActions {
  canEditScores: boolean;
  canEditAdjustment: boolean;
  requiresScoreComment: boolean;
}

export interface PerformanceSheetSummary {
  id: Uuid;
  periodId: Uuid;
  userId: DecimalInt64;
  positionId: DecimalInt64;
  isComplete: boolean;
  coefficient: Coefficient;
  actions: SheetActions;
  employeeName: string | null;
  positionName: string | null;
}

export interface PerformanceSheet {
  summary: PerformanceSheetSummary;
  criteria: SheetCriterion[];
  adjustment: Adjustment | null;
}

export interface PerformanceSheetWrapper {
  performanceSheet: PerformanceSheet;
}

export interface SetCriterionScoreRequest {
  /** Required non-null; omission or explicit null is rejected. */
  score: number;
  comment?: string;
}

export interface SetAdjustmentRequest {
  /** Required non-null; omission or explicit null is rejected. */
  value: number;
  comment: string;
}

/**
 * One atomic sheet-save command: absent/empty `scores` means no score edits,
 * an absent `adjustment` leaves it unchanged, explicit nulls are rejected.
 * At least one change is required.
 */
export interface SavePerformanceSheetRequest {
  scores?: SaveScoreEntry[];
  adjustment?: SaveSheetAdjustment;
}

export interface SaveScoreEntry {
  sheetCriterionId: Uuid;
  /** Required non-null integer; `0` is an intentional value. */
  score: number;
  /** Optional here; comment rules are evaluated by Motivation against locked state. */
  comment?: string;
}

export interface SaveSheetAdjustment {
  value: number;
  comment: string;
}

/**
 * Read-only search: an absent `userIds` selects the complete authorized
 * scope; `[]` selects no users; explicit `null` is rejected by the server.
 * Do not normalize an absent filter to an empty array.
 */
export interface SheetSearchRequest {
  periodId: Uuid;
  userIds?: DecimalInt64[];
}

export interface SheetSummaryList {
  items: PerformanceSheetSummary[];
}

// --- Payroll ---

export interface PayrollResult {
  periodId: Uuid;
  userId: DecimalInt64;
  positionId: DecimalInt64;
  coefficient: Coefficient;
  employeeName: string | null;
  positionName: string | null;
}

export interface PayrollResultList {
  items: PayrollResult[];
}

// --- Close operations ---

export interface OperationError {
  code: string;
  message: string;
}

export interface ClosePeriodOperation {
  operationId: Uuid;
  periodId: Uuid;
  requesterUserId: DecimalInt64;
  state: CloseOperationState;
  processedSheets: number;
  totalSheets: number;
  createdAt: TimestampString;
  startedAt: TimestampString | null;
  finishedAt: TimestampString | null;
  /** Present exactly when state is `succeeded`. */
  result: Period | null;
  /** Present exactly when state is `failed`. */
  error: OperationError | null;
}

export interface CloseOperationWrapper {
  operation: ClosePeriodOperation;
  /** Relative polling URL, identical to the `Location` response header. */
  pollUrl: string;
}

// --- Errors ---

export interface FieldViolation {
  /** Public REST property or header name, e.g. `Idempotency-Key`. */
  field: string;
  description: string;
}

export interface MotivationError {
  /** Stable uppercase machine-readable code, e.g. `INVALID_ARGUMENT`. */
  code: string;
  message: string;
  fieldViolations: FieldViolation[];
  requestId: string;
}

export interface MotivationErrorResponse {
  error: MotivationError;
}
