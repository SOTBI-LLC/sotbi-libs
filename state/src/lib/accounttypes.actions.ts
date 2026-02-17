import type { SimpleEditModel } from '@sotbi/models';

export class FetchAccountTypes {
  public static readonly type = '[ACCOUNTTYPES] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetAccountType {
  public static readonly type = '[ACCOUNTTYPES] Get item';
  constructor(public payload: number) {}
}

export class AddAccountType {
  public static readonly type = '[ACCOUNTTYPES] Add item';
  constructor(public payload: string) {}
}

export class EditAccountType {
  public static readonly type = '[ACCOUNTTYPES] Edit item';
  constructor(
    public payload: Partial<SimpleEditModel> & { id: number | string },
  ) {}
}

export class DeleteAccountType {
  public static readonly type = '[ACCOUNTTYPES] Delete item';
  constructor(public payload: number) {}
}
