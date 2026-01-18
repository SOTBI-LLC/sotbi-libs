import { User, UserPosition } from '@sotbi/models';

export class FetchUsers {
  public static readonly type = '[USERS] Fetch items';
  constructor(
    public payload: { loadFired: boolean; refresh: boolean } = { loadFired: false, refresh: false },
  ) {}
}

export class FillUsersShort {
  public static readonly type = '[USERS] Fill Users Short map';
}

export class FilterUsers {
  public static readonly type = '[USERS] Filter Items';
  constructor(public payload: Set<number>) {}
}

export class GetUser {
  public static readonly type = '[USERS] Get item';
  constructor(public payload: { id: number; refresh?: boolean } = { id: 0, refresh: false }) {}
}

export class AddUser {
  public static readonly type = '[USERS] Add item';
  constructor(public payload: User) {}
}

export class AddDirtyItem {
  public static readonly type = '[USERS] Add dirty edit item';
  constructor(public payload: Partial<UserPosition>) {}
}

export class ClearDirtyPositions {
  public static readonly type = '[USERS] Clear dirty positions';
}

export class EditUser {
  public static readonly type = '[USERS] Edit item';
  constructor(public payload: Partial<User>) {}
}

export class StartEditItem {
  public static readonly type = '[USERS] Start edit item';
  constructor(public payload: { id: number; dirty: boolean }) {}
}

export class EditUserPosition {
  public static readonly type = '[USERS] Edit item position';
  constructor(public payload: UserPosition[]) {}
}

export class DeleteUser {
  public static readonly type = '[USERS] Delete item';
  constructor(public payload: number) {}
}

export class GetUserHeadDepartment {
  public static readonly type = '[USERS] Get user head department';
  constructor(public payload: number) {}
}

export class ResetUserHeadDepartment {
  public static readonly type = '[USERS] Reset user head department';
}
