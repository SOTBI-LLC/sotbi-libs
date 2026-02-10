import type { SimpleEdit2Model } from '@sotbi/models';

export class FetchAdvertTypes {
  public static readonly type = '[ADVERTTYPE] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[ADVERTTYPE] Get item';
  constructor(public payload: { id: number }) {}
}

export class AddItem {
  public static readonly type = '[ADVERTTYPE] Add item';
  constructor(public payload: SimpleEdit2Model) {}
}
export class AddEmptyItem {
  public static readonly type = '[ADVERTTYPE] Add empty item';
}

export class EditItem {
  public static readonly type = '[ADVERTTYPE] Edit item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class DeleteItem {
  public static readonly type = '[ADVERTTYPE] Delete item';
  constructor(public payload: number) {}
}
