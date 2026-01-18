import { SimpleEditModel } from '@sotbi/models';

export class FetchAssetTypes {
  public static readonly type = '[ASSETS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[ASSETS] Get item';
  constructor(public payload: { id: number }) {}
}

export class AddItem {
  public static readonly type = '[ASSETS] Add item';
  constructor(public payload: SimpleEditModel) {}
}

export class EditItem {
  public static readonly type = '[ASSETS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[ASSETS] Delete item';
  constructor(public payload: number) {}
}
