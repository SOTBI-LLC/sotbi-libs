import { SimpleEditModel } from '@sotbi/models';

export class FetchPersons {
  public static readonly type = '[PERSONS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[PERSONS] Get item';
  constructor(public payload: { id: number }) {}
}

export class AddItem {
  public static readonly type = '[PERSONS] Add item';
  constructor(public payload: SimpleEditModel) {}
}

export class EditItem {
  public static readonly type = '[PERSONS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[PERSONS] Delete item';
  constructor(public payload: number) {}
}
