import type {
  PerformanceCriteria,
  PerformanceCriteriaRequest,
} from '@sotbi/models';

export class PerformanceCriteriaAddAction {
  public static readonly type = '[PerformanceCriteria] Add item';
  constructor(public readonly payload: PerformanceCriteria) {}
}

export class PerformanceCriteriaGetActions {
  public static readonly type = '[PerformanceCriteria] Get items';
  constructor(public readonly payload: PerformanceCriteriaRequest) {}
}

export class PerformanceCriteriaPutAction {
  public static readonly type = '[PerformanceCriteria] Put item';
  constructor(public readonly payload: PerformanceCriteria) {}
}
