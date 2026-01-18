import { SimpleEdit2Model } from '@sotbi/models';

export class FetchStaffTypes {
  public static readonly type = '[STAFF TYPE] Fetch items';
}

export class GetStaffType {
  public static readonly type = '[STAFF TYPE] Get item';
  constructor(public payload: number) {}
}

export class AddStaffItem {
  public static readonly type = '[STAFF TYPE] Add item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class EditStaffItem {
  public static readonly type = '[STAFF TYPE] Edit item';
  constructor(public payload: SimpleEdit2Model) {}
}

export class DeleteStaffItem {
  public static readonly type = '[STAFF TYPE] Delete item';
  constructor(public payload: number) {}
}
