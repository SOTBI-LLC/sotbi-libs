import { Arbitration } from '@sotbi/models';

export class FetchArbitrations {
  public static readonly type = '[ARBITRS] Fetch items';
}

export class GetArbitration {
  public static readonly type = '[ARBITRS] Get item';
  constructor(public payload: string) {}
}

export class AddArbitration {
  public static readonly type = '[ARBITRS] Add item';
  constructor(public payload: string) {}
}

export class EditArbitration {
  public static readonly type = '[ARBITRS] Edit item';
  constructor(public payload: Arbitration) {}
}

export class DeleteArbitration {
  public static readonly type = '[ARBITRS] Delete item';
  constructor(public payload: string) {}
}
