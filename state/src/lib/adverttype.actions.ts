import type { SimpleEdit2Model } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';
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
  constructor(public payload: Partial<SimpleEdit2Model>) {}
}
export class AddEmptyAdvertType {
  public static readonly type = '[ADVERTTYPE] Add empty item';
}

export class EditAdvertType {
  public static readonly type = '[ADVERTTYPE] Edit item';
  constructor(public payload: WithId<SimpleEdit2Model>) {}
}

export class DeleteAdvertType {
  public static readonly type = '[ADVERTTYPE] Delete item';
  constructor(public payload: number) {}
}
