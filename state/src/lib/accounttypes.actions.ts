import { SimpleEditModel } from '@sotbi/models';

export class FetchAccountTypes {
  public static readonly type = '[ACCOUNTTYPES] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[ACCOUNTTYPES] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[ACCOUNTTYPES] Add item';
  constructor(public payload: string) {}
}

export class EditItem {
  public static readonly type = '[ACCOUNTTYPES] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[ACCOUNTTYPES] Delete item';
  constructor(public payload: number) {}
}
