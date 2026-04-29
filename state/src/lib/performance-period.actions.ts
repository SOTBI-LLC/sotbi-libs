import type { PerformancePeriod } from '@sotbi/models';

export class PerformancePeriodAction {
  public static readonly type = '[PerformancePeriod] Add item';
  constructor(public readonly payload: PerformancePeriod) {}
}
