import type { SaveAppraiserRequest } from '@sotbi/models';

export class FetchAppraisers {
  static readonly type = '[Appraisers] Fetch';
}

export class SaveAppraiser {
  static readonly type = '[Appraisers] Save';
  constructor(
    public readonly item: SaveAppraiserRequest,
    public readonly id?: number,
  ) {}
}

export class DeleteAppraiser {
  static readonly type = '[Appraisers] Delete';
  constructor(public readonly id: number) {}
}
