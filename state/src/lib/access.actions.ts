import type { Access } from '@sotbi/models';
export class CreateAccess {
  public static readonly type = '[ACCESS] Create item';
  constructor(public payload: Partial<Access>) {}
}

export class FetchAccess {
  public static readonly type = '[ACCESS] Read items';
}

export class GetAccess {
  public static readonly type = '[ACCESS] Read access path';
  constructor(public payload: { id: number }) {}
}

export class UpdateAccess {
  public static readonly type = '[ACCESS] Update access path';
  constructor(public payload: Partial<Access> & { id: number }) {}
}

export class DeleteAccess {
  public static readonly type = '[ACCESS] Delete access path';
  constructor(public payload: number) {}
}
