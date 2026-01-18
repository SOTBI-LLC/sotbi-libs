import { EgrnRequest } from '@sotbi/models';

export class FetchItems {
  public static readonly type = '[EGRN REQUEST] Fetch items';
  constructor(
    public readonly payload: { refresh: boolean; view: boolean } = { refresh: false, view: false },
  ) {}
}

export class GetItem {
  public static readonly type = '[EGRN REQUEST] Get item';
  constructor(public readonly payload: number) {}
}

export class AddItem {
  public static readonly type = '[EGRN REQUEST] Add item';
  constructor(public readonly payload: Partial<EgrnRequest>) {}
}

export class AddDirtyItem {
  public static readonly type = '[EGRN REQUEST] Add dirty item';
  constructor(public readonly payload: number) {}
}

export class UpdateItem {
  public static readonly type = '[EGRN REQUEST] Update item';
  constructor(public readonly payload: Partial<EgrnRequest>) {}
}

export class DeleteItem {
  public static readonly type = '[EGRN REQUEST] Delete item';
  constructor(public readonly payload: number) {}
}

export class RemoveRealEstate {
  public static readonly type = '[EGRN REQUEST] Remove Real-Estate item';
  constructor(public readonly payload: { idx: number; id: number }) {}
}
