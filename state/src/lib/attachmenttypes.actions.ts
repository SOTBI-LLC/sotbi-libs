import type { SimpleEditModel } from '@sotbi/models';

export class FetchAttachmentTypes {
  public static readonly type = '[AttachmentTypes] Fetch types';
  // constructor(public payload: { type: string }) {}
}

export class GetItem {
  public static readonly type = '[AttachmentTypes] Get item';
  constructor(public payload: { id: number }) {}
}

export class AddItem {
  public static readonly type = '[AttachmentTypes] Add item';
  constructor(public payload: SimpleEditModel) {}
}

export class EditItem {
  public static readonly type = '[AttachmentTypes] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteItem {
  public static readonly type = '[AttachmentTypes] Delete item';
  constructor(public payload: number) {}
}
