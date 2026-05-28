import type {
  SelectedPeriod,
  UserPercentageRequest,
  UserPerformance,
} from '@sotbi/models';

export class UserPerformanceUpsertAction {
  public static readonly type = '[UserPerformance] Upsert item';
  constructor(public readonly payload: UserPerformance) {}
}

export class UserPerformanceGetActions {
  public static readonly type = '[UserPerformance] Get items';
  constructor(public readonly payload: UserPercentageRequest) {}
}

export class UserPerformanceSelectPeriod {
  public static readonly type = '[UserPerformance] Select period';
  constructor(public readonly payload: SelectedPeriod) {}
}
