import type { UserGroup } from '@sotbi/models';

export class CreateUserGroup {
  public static readonly type = '[USER_GROUP] Create item';
  constructor(public payload: Partial<UserGroup>) {}
}

export class FetchGroups {
  public static readonly type = '[USER_GROUP] Read items';
  constructor(public payload: boolean) {}
}

export class GetUserGroup {
  public static readonly type = '[USER_GROUP] Read item';
  constructor(public payload: number) {}
}

export class UpdateUserGroup {
  public static readonly type = '[USER_GROUP] Update item';
  constructor(public payload: Partial<UserGroup>) {}
}

export class DeleteUserGroup {
  public static readonly type = '[USER_GROUP] Delete item';
  constructor(public payload: number) {}
}
