import type { SimpleEdit2Model } from '@sotbi/models';
export class FetchAdvertTypes {
  public static readonly type = '[ADVERTTYPE] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetAdvertType {
  public static readonly type = '[ADVERTTYPE] Get item';
  constructor(public payload: { id: number }) {}
}

export class AddAdvertType {
  public static readonly type = '[ADVERTTYPE] Add item';
  constructor(
    public payload: Partial<SimpleEdit2Model> & { id: number | string },
  ) {}
}
export class AddEmptyAdvertType {
  public static readonly type = '[ADVERTTYPE] Add empty item';
}

export class EditAdvertType {
  public static readonly type = '[ADVERTTYPE] Edit item';
  constructor(
    public payload: Partial<SimpleEdit2Model> & { id: number | string },
  ) {}
}

export class DeleteAdvertType {
  public static readonly type = '[ADVERTTYPE] Delete item';
  constructor(public payload: number) {}
}
