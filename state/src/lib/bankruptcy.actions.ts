import type { Bankruptcy, InsurancePolicy } from '@sotbi/models';

export class CreateBankruptcy {
  public static readonly type = '[BANKRUPTCIES] Create item';
  constructor(public payload: Partial<Bankruptcy>) {}
}

export class FetchBankruptcies {
  public static readonly type = '[BANKRUPTCIES] Read items';
}

export class GetBankruptcy {
  public static readonly type = '[BANKRUPTCIES] Read item';
  constructor(public payload: number) {}
}

export class UpdateBankruptcy {
  public static readonly type = '[BANKRUPTCIES] Update item';
  constructor(public payload: Bankruptcy) {}
}

export class ClearSelectedBankruptcy {
  public static readonly type = '[BANKRUPTCIES] Clear Selected Bankruptcy';
}

export class DeleteBankruptcy {
  public static readonly type = '[BANKRUPTCIES] Delete item';
  constructor(public payload: number) {}
}

export class UpdateBankruptcyPolicy {
  public static readonly type = '[BANKRUPTCIES] Update policy';
  constructor(public payload: InsurancePolicy) {}
}

export class AddBankruptcyPolicy {
  public static readonly type = '[BANKRUPTCIES] Add policy';
  constructor(public payload: InsurancePolicy) {}
}

export class DeleteBankruptcyPolicy {
  public static readonly type = '[BANKRUPTCIES] delete policy';
  constructor(public payload: number) {}
}
