import type { SimpleEditModel } from '@sotbi/models';

export class FetchTargetTypes {
  public static readonly type = '[TARGETS] Fetch target types';
}

export class GetItem {
  public static readonly type = '[TARGETS] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[TARGETS] Add item';
  constructor(public payload: SimpleEditModel) {}
}

export class EditItem {
  public static readonly type = '[TARGETS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[TARGETS] Delete item';
  constructor(public payload: number) {}
}
