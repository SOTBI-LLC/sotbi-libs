import { UserGroup } from '@sotbi/models';

export class CreateItem {
  public static readonly type = '[USER_GROUP] Create item';
  constructor(public payload: Partial<UserGroup>) {}
}

export class FetchGroups {
  public static readonly type = '[USER_GROUP] Read items';
}

export class GetItem {
  public static readonly type = '[USER_GROUP] Read item';
  constructor(public payload: number) {}
}

export class UpdateItem {
  public static readonly type = '[USER_GROUP] Update item';
  constructor(public payload: Partial<UserGroup>) {}
}

export class DeleteItem {
  public static readonly type = '[USER_GROUP] Delete item';
  constructor(public payload: number) {}
}
