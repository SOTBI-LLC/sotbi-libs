import type { PerformancePeriod } from '@sotbi/models';

export class PerformancePeriodGetActions {
  public static readonly type = '[PerformancePeriod] Get items';
}
export class PerformancePeriodAddOrPutAction {
  public static readonly type = '[PerformancePeriod] Put item';
  constructor(public readonly payload: PerformancePeriod) {}
}
