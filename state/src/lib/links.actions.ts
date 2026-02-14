import type { SimpleEditModel } from '@sotbi/models';

export class FetchLinkTypes {
  public static readonly type = '[LINKS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[LINKS] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[LINKS] Add item';
  constructor(public payload: string) {}
}

export class EditItem {
  public static readonly type = '[LINKS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[LINKS] Delete item';
  constructor(public payload: number) {}
}
