import type { BaseCriteria } from '@sotbi/models';

export class BaseCriteriaAction {
  public static readonly type = '[BaseCriteria] Add item';
  constructor(public readonly payload: BaseCriteria) {}
}
