import type { BidState } from '@sotbi/models';

export class FetchBidState {
  public static readonly type = '[BID STATES] Fetch items';
}

export class GetBidState {
  public static readonly type = '[BID STATES] Get item';
  constructor(public payload: number) {}
}

export class EditBidState {
  public static readonly type = '[BID STATES] Edit item';
  constructor(public payload: { idx: number; item: Partial<BidState> }) {}
}

export class AddBidState {
  public static readonly type = '[BID STATES] Add item';
  constructor(public payload: { idx: number; item: Partial<BidState> }) {}
}

export class AddEmptyBidState {
  public static readonly type = '[BID STATES] Add empty item';
}

export class SaveAllBidState {
  public static readonly type = '[BID STATES] Save all item';
}

export class UpdateBidState {
  public static readonly type = '[BID STATES] Update item';
  constructor(public payload: BidState) {}
}

export class CancelBidState {
  public static readonly type = '[BID STATES] Cancel edited item';
  constructor(public payload: number) {}
}

export class EmptyBidState {
  public static readonly type = '[BID STATES] Empty not saved item';
  constructor(public payload: number) {}
}

export class DeleteBidState {
  public static readonly type = '[BID STATES] Delete item';
  constructor(public payload: number) {}
}
