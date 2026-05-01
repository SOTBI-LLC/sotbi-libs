import type { BaseCriteria } from '@sotbi/models';

export class BaseCriteriaAddAction {
  public static readonly type = '[BaseCriteria] Add item';
  constructor(public readonly payload: BaseCriteria) {}
}

export class BaseCriteriaGetActions {
  public static readonly type = '[BaseCriteria] Get items';
}

export class BaseCriteriaPutAction {
  public static readonly type = '[BaseCriteria] Put item';
  constructor(public readonly payload: BaseCriteria) {}
}
