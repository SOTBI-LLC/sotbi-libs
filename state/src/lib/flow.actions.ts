import type { SimpleEdit2Model } from '@sotbi/models';

export class FetchFlowTypes {
  public static readonly type = '[FLOW] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[FLOW] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[FLOW] Add item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class EditItem {
  public static readonly type = '[FLOW] Edit item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class DeleteItem {
  public static readonly type = '[FLOW] Delete item';
  constructor(public payload: number) {}
}
