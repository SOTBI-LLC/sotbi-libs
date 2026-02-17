import type { SimpleEdit2Model } from '@sotbi/models';

export class FetchFlowTypes {
  public static readonly type = '[FLOW] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetFlow {
  public static readonly type = '[FLOW] Get item';
  constructor(public payload: number) {}
}

export class AddFlow {
  public static readonly type = '[FLOW] Add item';
  constructor(
    public payload: Partial<SimpleEdit2Model> & { id: number | string },
  ) {}
}

export class EditFlow {
  public static readonly type = '[FLOW] Edit item';
  constructor(
    public payload: Partial<SimpleEdit2Model> & { id: number | string },
  ) {}
}

export class DeleteFlow {
  public static readonly type = '[FLOW] Delete item';
  constructor(public payload: number) {}
}
