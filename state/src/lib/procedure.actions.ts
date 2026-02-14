import type { SimpleEdit2Model } from '@sotbi/models';

export class FetchProcedures {
  public static readonly type = '[PROCEDURE] Fetch all procedures';
}

export class GetItem {
  public static readonly type = '[PROCEDURE] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[PROCEDURE] Add item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class EditItem {
  public static readonly type = '[PROCEDURE] Edit item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class DeleteItem {
  public static readonly type = '[PROCEDURE] Delete item';
  constructor(public payload: number) {}
}
