import type { SimpleEditModel } from '@sotbi/models';

export class FetchAssetTypes {
  public static readonly type = '[ASSETS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetAsset {
  public static readonly type = '[ASSETS] Get item';
  constructor(public payload: { id: number }) {}
}

export class AddAsset {
  public static readonly type = '[ASSETS] Add item';
  constructor(public payload: SimpleEditModel) {}
}

export class EditAsset {
  public static readonly type = '[ASSETS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteAsset {
  public static readonly type = '[ASSETS] Delete item';
  constructor(public payload: number) {}
}
