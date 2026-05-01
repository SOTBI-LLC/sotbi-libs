import type { PerformanceCriteria } from '@sotbi/models';

export class PerformanceCriteriaAddAction {
  public static readonly type = '[PerformanceCriteria] Add item';
  constructor(public readonly payload: PerformanceCriteria) {}
}

export class PerformanceCriteriaGetActions {
  public static readonly type = '[PerformanceCriteria] Get items';
}

export class PerformanceCriteriaPutAction {
  public static readonly type = '[PerformanceCriteria] Put item';
  constructor(public readonly payload: PerformanceCriteria) {}
}
