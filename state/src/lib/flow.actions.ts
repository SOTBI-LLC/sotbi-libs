import type { SimpleEdit2Model } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchFlowTypes {
  public static readonly type = '[FLOW] Fetch items';
}

export class GetFlow {
  public static readonly type = '[FLOW] Get item';
  constructor(public payload: number) {}
}

export class AddFlow {
  public static readonly type = '[FLOW] Add item';
  constructor(public payload: Partial<SimpleEdit2Model>) {}
}

export class EditFlow {
  public static readonly type = '[FLOW] Edit item';
  constructor(public payload: WithId<SimpleEdit2Model>) {}
}

export class DeleteFlow {
  public static readonly type = '[FLOW] Delete item';
  constructor(public payload: number) {}
}
