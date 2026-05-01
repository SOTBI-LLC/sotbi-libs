import type { UserPercentageRequest, UserPerformance } from '@sotbi/models';

export class UserPerformanceUpsertAction {
  public static readonly type = '[UserPerformance] Upsert item';
  constructor(public readonly payload: UserPerformance) {}
}

export class UserPerformanceGetActions {
  public static readonly type = '[UserPerformance] Get items';
  constructor(public readonly payload: UserPercentageRequest) {}
}
