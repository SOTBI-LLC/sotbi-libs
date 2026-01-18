import { Sro } from '@sotbi/models';

export class FetchSros {
  public static readonly type = '[SROS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetSro {
  public static readonly type = '[SROS] Get item';
  constructor(public payload: number) {}
}

export class AddSro {
  public static readonly type = '[SROS] Add item';
  constructor(public payload: Partial<Sro>) {}
}

export class EditSro {
  public static readonly type = '[SROS] Edit item';
  constructor(public payload: Partial<Sro>) {}
}

export class DeleteSro {
  public static readonly type = '[SROS] Delete item';
  constructor(public payload: number) {}
}
