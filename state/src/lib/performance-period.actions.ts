import type { PerformancePeriod } from '@sotbi/models';

export class PerformancePeriodGetActions {
  public static readonly type = '[PerformancePeriod] Get items';
}
export class PerformancePeriodPutAction {
  public static readonly type = '[PerformancePeriod] Put item';
  constructor(public readonly payload: PerformancePeriod) {}
}

// check : добавлен, на бэке нет пока
export class PerformancePeriodAddAction {
  public static readonly type = '[PerformancePeriod] Add item';
  constructor(public readonly payload: PerformancePeriod) {}
}
