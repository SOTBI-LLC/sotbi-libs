import type { SimpleEdit2Model } from '@sotbi/models';

export class FetchItems {
  public static readonly type = '[CATEGORY] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[CATEGORY] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[CATEGORY] Add item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class EditItem {
  public static readonly type = '[CATEGORY] Edit item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class DeleteItem {
  public static readonly type = '[CATEGORY] Delete item';
  constructor(public payload: number) {}
}
