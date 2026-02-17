import type { SimpleEditModel } from '@sotbi/models';

export class FetchProfits {
  public static readonly type = '[PROFITS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetProfit {
  public static readonly type = '[PROFITS] Get item';
  constructor(public payload: number) {}
}

export class AddProfit {
  public static readonly type = '[PROFITS] Add item';
  constructor(
    public payload: Partial<SimpleEditModel> & { id: number | string },
  ) {}
}

export class EditProfit {
  public static readonly type = '[PROFITS] Edit item';
  constructor(
    public payload: Partial<SimpleEditModel> & { id: number | string },
  ) {}
}

export class DeleteProfit {
  public static readonly type = '[PROFITS] Delete item';
  constructor(public payload: number) {}
}
