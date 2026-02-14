import type { Staff } from '@sotbi/models';

export class FetchStaffs {
  public static readonly type = '[Staff] Fetch items';
  constructor(public payload: number[] = []) {}
}
export class FetchRPG {
  public static readonly type = '[Staff] Fetch only RPG/Partner';
}
export class LoadTree {
  public static readonly type = '[Staff] Load Staff Items as Tree';
}
export class FetchFlatStaff {
  public static readonly type = '[Staff] Fetch Flat items';
}

export class GetStaff {
  public static readonly type = '[Staff] Get item';
  constructor(public payload: number) {}
}

export class AddStaff {
  public static readonly type = '[Staff] Add item';
  constructor(public payload: Partial<Staff>) {}
}

export class EditStaff {
  public static readonly type = '[Staff] Edit item';
  constructor(public payload: Partial<Staff>) {}
}

export class DeleteStaff {
  public static readonly type = '[Staff] Delete item';
  constructor(public payload: number) {}
}
