import type { Deposit } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchDeposits {
  public static readonly type = '[DEPOSITS] Fetch items';
}

export class GetDeposit {
  public static readonly type = '[DEPOSITS] Get item';
  constructor(public payload: number) {}
}

export class AddDeposit {
  public static readonly type = '[DEPOSITS] Add item';
  constructor(public payload: Partial<Deposit>) {}
}

export class EditDeposit {
  public static readonly type = '[DEPOSITS] Edit item';
  constructor(public payload: WithId<Deposit>) {}
}

export class DeleteDeposit {
  public static readonly type = '[DEPOSITS] Delete item';
  constructor(public payload: number) {}
}
