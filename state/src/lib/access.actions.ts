import type { Access } from '@sotbi/models';

export class CreateItem {
  public static readonly type = '[ACCESS] Create item';
  constructor(public payload: Partial<Access>) {}
}

export class FetchAccess {
  public static readonly type = '[ACCESS] Read items';
}

export class GetItem {
  public static readonly type = '[ACCESS] Read access path';
  constructor(public payload: { id: number }) {}
}

export class UpdateItem {
  public static readonly type = '[ACCESS] Update access path';
  constructor(public payload: Partial<Access> & { id: number }) {}
}

export class DeleteItem {
  public static readonly type = '[ACCESS] Delete access path';
  constructor(public payload: number) {}
}
