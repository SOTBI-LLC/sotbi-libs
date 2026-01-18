import { Defrayment } from '@sotbi/models';

export class GetAllItems {
  public static readonly type = '[DEFRAYMENT] Get all items';
  constructor(public readonly payload: number) {}
}

export class GetItem {
  public static readonly type = '[DEFRAYMENT] Get item';
  constructor(public readonly payload: number) {}
}

export class AddItem {
  public static readonly type = '[DEFRAYMENT] Add item';
  constructor(public readonly payload: Partial<Defrayment>) {}
}

export class UpdateItem {
  public static readonly type = '[DEFRAYMENT] Update item';
  constructor(public readonly payload: Partial<Defrayment>) {}
}

export class DeleteItem {
  public static readonly type = '[DEFRAYMENT] Delete item';
  constructor(public readonly payload: number) {}
}
