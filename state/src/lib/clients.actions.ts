import { SimpleEditModel } from '@sotbi/models';

export class FetchClients {
  public static readonly type = '[CLIENTS] Fetch all clients';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[CLIENTS] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[CLIENTS] Add item';
  constructor(public payload: SimpleEditModel) {}
}

export class EditItem {
  public static readonly type = '[CLIENTS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[CLIENTS] Delete item';
  constructor(public payload: number) {}
}
