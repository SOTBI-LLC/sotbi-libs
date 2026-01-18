import { BankDetail } from '@sotbi/models';

export class GetBankDetails {
  public static readonly type = '[BANK DETAIL] Get all items';
  constructor(public payload: string) {}
}

export class UpdateBankDetails {
  public static readonly type = '[BANK DETAIL] Update items';
  constructor(public payload: Partial<BankDetail>[]) {}
}
