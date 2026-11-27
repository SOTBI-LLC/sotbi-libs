import type { SaveAppraiserRequest } from '@sotbi/models';

export class FetchAppraisers {
  public static readonly type = '[Appraisers] Fetch';
}

export class SaveAppraiser {
  public static readonly type = '[Appraisers] Save';
  constructor(
    public readonly item: SaveAppraiserRequest,
    public readonly id?: number,
  ) {}
}

export class DeleteAppraiser {
  public static readonly type = '[Appraisers] Delete';
  constructor(public readonly id: number) {}
}
