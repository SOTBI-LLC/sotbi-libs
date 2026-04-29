import type { PerformanceCriteria } from '@sotbi/models';

export class PerformanceCriteriaAction {
  public static readonly type = '[PerformanceCriteria] Add item';
  constructor(public readonly payload: PerformanceCriteria) {}
}
