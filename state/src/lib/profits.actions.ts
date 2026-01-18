import { SimpleEditModel } from '@sotbi/models';

export class FetchProfits {
  public static readonly type = '[PROFITS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[PROFITS] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[PROFITS] Add item';
  constructor(public payload: SimpleEditModel) {}
}

export class EditItem {
  public static readonly type = '[PROFITS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[PROFITS] Delete item';
  constructor(public payload: number) {}
}
