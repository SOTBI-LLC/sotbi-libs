import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { MotivationApiService } from '@sotbi/data-access';
import type {
  CapHistory,
  PerformanceSheet,
  Period,
  PeriodSummaryList,
  SheetSummaryList,
  Uuid,
} from '@sotbi/models';
import type { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/** Server view state: data stays distinct from loading and failure. */
export interface ServerResource<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

function idleResource<T>(): ServerResource<T> {
  return { data: null, loading: false, error: null };
}

/**
 * Scoped server-state facade for Motivation reads.
 *
 * Every load is captured by a data generation. Results of an outdated
 * generation are dropped instead of overwriting newer server state, so a
 * committed save adoption (and the dirty editor behind it) can never be
 * clobbered by a stale response. Switching the effective user or the open
 * sheet cancels obsolete in-flight loads; switching or reopening the effective
 * user clears every cached view.
 */
@Injectable({
  providedIn: 'root',
})
export class MotivationServerState {
  private readonly api = inject(MotivationApiService);
  private readonly destroyRef = inject(DestroyRef);

  private effectiveUserId: string | null = null;
  /** Bumped on scope change and whenever committed data replaces a view. */
  private dataGeneration = 0;
  private sheetGenerations = new Map<Uuid, number>();
  private subscriptions = new Map<string, Subscription>();
  private sessionResetHandlers = new Set<() => void>();

  private readonly periodsResource = signal<ServerResource<PeriodSummaryList>>(
    idleResource(),
  );
  private readonly capHistoryResource = signal<ServerResource<CapHistory>>(
    idleResource(),
  );
  private readonly periodResources = signal<
    Record<string, ServerResource<Period>>
  >({});
  private readonly sheetSummaryResources = signal<
    Record<string, ServerResource<SheetSummaryList>>
  >({});
  private readonly sheetResources = signal<
    Record<string, ServerResource<PerformanceSheet>>
  >({});

  public readonly periods = this.periodsResource.asReadonly();
  public readonly capHistory = this.capHistoryResource.asReadonly();
  public readonly periodMap = this.periodResources.asReadonly();
  public readonly sheetSummaryMap = this.sheetSummaryResources.asReadonly();
  public readonly sheetMap = this.sheetResources.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => this.unsubscribeAll());
  }

  public periodOf(periodId: Uuid): ServerResource<Period> {
    return this.periodResources()[periodId] ?? idleResource<Period>();
  }

  public sheetSummariesOf(periodId: Uuid): ServerResource<SheetSummaryList> {
    return (
      this.sheetSummaryResources()[periodId] ?? idleResource<SheetSummaryList>()
    );
  }

  public sheetOf(sheetId: Uuid): ServerResource<PerformanceSheet> {
    return this.sheetResources()[sheetId] ?? idleResource<PerformanceSheet>();
  }

  /**
   * Registers memory-only feature state (for example an editor draft or a
   * visibility poller) for the same effective-user lifecycle as server data.
   */
  public registerSessionReset(reset: () => void): () => void {
    this.sessionResetHandlers.add(reset);
    return () => this.sessionResetHandlers.delete(reset);
  }

  /**
   * Re-scopes the facade. A real change cancels all in-flight loads and clears
   * every cached view so responses of the previous user never leak into the
   * new session.
   */
  public setEffectiveUser(userId: string | null): void {
    if (this.effectiveUserId === userId) {
      return;
    }
    this.effectiveUserId = userId;
    this.unsubscribeAll();
    this.dataGeneration++;
    this.sheetGenerations.clear();
    this.periodsResource.set(idleResource<PeriodSummaryList>());
    this.capHistoryResource.set(idleResource<CapHistory>());
    this.periodResources.set({});
    this.sheetSummaryResources.set({});
    this.sheetResources.set({});
    for (const reset of this.sessionResetHandlers) {
      reset();
    }
  }

  public loadPeriods(): void {
    const generation = this.dataGeneration;
    this.periodsResource.set({ data: null, loading: true, error: null });
    this.restart('periods', () =>
      this.api.listPeriods().subscribe({
        next: (data) => {
          if (generation === this.dataGeneration) {
            this.periodsResource.set({ data, loading: false, error: null });
          }
        },
        error: (error: unknown) => {
          if (generation === this.dataGeneration) {
            this.periodsResource.set({ data: null, loading: false, error });
          }
        },
      }),
    );
  }

  public loadCapHistory(): void {
    const generation = this.dataGeneration;
    this.capHistoryResource.set({ data: null, loading: true, error: null });
    this.restart('capHistory', () =>
      this.api.listCoefficientCapHistory().subscribe({
        next: (data) => {
          if (generation === this.dataGeneration) {
            this.capHistoryResource.set({ data, loading: false, error: null });
          }
        },
        error: (error: unknown) => {
          if (generation === this.dataGeneration) {
            this.capHistoryResource.set({ data: null, loading: false, error });
          }
        },
      }),
    );
  }

  public invalidateCapHistory(): void {
    this.cancel('capHistory');
    this.capHistoryResource.set(idleResource<CapHistory>());
  }

  public loadPeriod(periodId: Uuid): void {
    const key = `period:${periodId}`;
    const generation = this.dataGeneration;
    this.periodResources.update((entries) => ({
      ...entries,
      [periodId]: { data: null, loading: true, error: null },
    }));
    this.restart(key, () =>
      this.api.getPeriod(periodId).pipe(map((wrapper) => wrapper.period)).subscribe({
        next: (data) => {
          if (generation === this.dataGeneration) {
            this.periodResources.update((entries) => ({
              ...entries,
              [periodId]: { data, loading: false, error: null },
            }));
          }
        },
        error: (error: unknown) => {
          if (generation === this.dataGeneration) {
            this.periodResources.update((entries) => ({
              ...entries,
              [periodId]: { data: null, loading: false, error },
            }));
          }
        },
      }),
    );
  }

  /** Loads the authorized sheet summaries; an absent filter selects the full scope. */
  public loadSheetSummaries(periodId: Uuid): void {
    const key = `summaries:${periodId}`;
    const generation = this.dataGeneration;
    this.sheetSummaryResources.update((entries) => ({
      ...entries,
      [periodId]: { data: null, loading: true, error: null },
    }));
    this.restart(key, () =>
      this.api.searchPerformanceSheets({ periodId }).subscribe({
        next: (data) => {
          if (generation === this.dataGeneration) {
            this.sheetSummaryResources.update((entries) => ({
              ...entries,
              [periodId]: { data, loading: false, error: null },
            }));
          }
        },
        error: (error: unknown) => {
          if (generation === this.dataGeneration) {
            this.sheetSummaryResources.update((entries) => ({
              ...entries,
              [periodId]: { data: null, loading: false, error },
            }));
          }
        },
      }),
    );
  }

  public loadSheet(sheetId: Uuid): void {
    // Opening another sheet abandons other sheets' in-flight reads.
    for (const [key, id] of this.inFlightSheets()) {
      if (id !== sheetId) {
        this.cancel(key);
        this.bumpSheetGeneration(id);
        this.sheetResources.update((entries) => ({
          ...entries,
          [id]: idleResource<PerformanceSheet>(),
        }));
      }
    }

    const key = `sheet:${sheetId}`;
    const generation = this.dataGeneration;
    const sheetGeneration = this.currentSheetGeneration(sheetId);
    this.sheetResources.update((entries) => ({
      ...entries,
      [sheetId]: { data: null, loading: true, error: null },
    }));
    this.restart(key, () =>
      this.api.getPerformanceSheet(sheetId).pipe(map((wrapper) => wrapper.performanceSheet)).subscribe({
        next: (data) => {
          if (this.isCurrent(generation, sheetId, sheetGeneration)) {
            this.sheetResources.update((entries) => ({
              ...entries,
              [sheetId]: { data, loading: false, error: null },
            }));
          }
        },
        error: (error: unknown) => {
          if (this.isCurrent(generation, sheetId, sheetGeneration)) {
            this.sheetResources.update((entries) => ({
              ...entries,
              [sheetId]: { data: null, loading: false, error },
            }));
          }
        },
      }),
    );
  }

  /**
   * Adopts the committed server sheet after a successful atomic save and
   * invalidates the affected period views: any read issued before the save
   * carries pre-save data and must not land over the committed result.
   */
  public adoptSheet(wrapper: { performanceSheet: PerformanceSheet }): void {
    const sheet = wrapper.performanceSheet;
    const periodId = sheet.summary.periodId;
    this.dataGeneration++;
    this.bumpSheetGeneration(sheet.summary.id);
    this.sheetResources.update((entries) => ({
      ...entries,
      [sheet.summary.id]: { data: sheet, loading: false, error: null },
    }));

    this.cancel('periods');
    this.periodsResource.set(idleResource<PeriodSummaryList>());
    this.cancel(`period:${periodId}`);
    this.periodResources.update((entries) => ({
      ...entries,
      [periodId]: idleResource<Period>(),
    }));
    this.cancel(`summaries:${periodId}`);
    this.sheetSummaryResources.update((entries) => ({
      ...entries,
      [periodId]: idleResource<SheetSummaryList>(),
    }));
  }

  public invalidatePeriods(): void {
    this.cancel('periods');
    this.periodsResource.set(idleResource<PeriodSummaryList>());
  }

  public invalidatePeriod(periodId: Uuid): void {
    this.cancel(`period:${periodId}`);
    this.periodResources.update((entries) => ({
      ...entries,
      [periodId]: idleResource<Period>(),
    }));
  }

  public invalidateSheetSummaries(periodId: Uuid): void {
    this.cancel(`summaries:${periodId}`);
    this.sheetSummaryResources.update((entries) => ({
      ...entries,
      [periodId]: idleResource<SheetSummaryList>(),
    }));
  }

  private isCurrent(generation: number, sheetId: Uuid, sheetGeneration: number): boolean {
    return (
      generation === this.dataGeneration &&
      sheetGeneration === (this.sheetGenerations.get(sheetId) ?? 0)
    );
  }

  private currentSheetGeneration(sheetId: Uuid): number {
    return this.sheetGenerations.get(sheetId) ?? 0;
  }

  private bumpSheetGeneration(sheetId: Uuid): void {
    this.sheetGenerations.set(sheetId, this.currentSheetGeneration(sheetId) + 1);
  }

  private inFlightSheets(): Array<[key: string, sheetId: Uuid]> {
    const result: Array<[key: string, sheetId: Uuid]> = [];
    for (const key of this.subscriptions.keys()) {
      if (key.startsWith('sheet:')) {
        result.push([key, key.slice('sheet:'.length)]);
      }
    }
    return result;
  }

  private restart(key: string, subscribe: () => Subscription): void {
    this.cancel(key);
    this.subscriptions.set(key, subscribe());
  }

  private cancel(key: string): void {
    this.subscriptions.get(key)?.unsubscribe();
    this.subscriptions.delete(key);
  }

  private unsubscribeAll(): void {
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe();
    }
    this.subscriptions.clear();
  }
}
