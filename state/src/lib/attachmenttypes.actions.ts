import type { SimpleEditModel } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchAttachmentTypes {
  public static readonly type = '[AttachmentTypes] Fetch types';
  // constructor(public payload: { type: string }) {}
}

export class GetAttachmentType {
  public static readonly type = '[AttachmentTypes] Get item';
  constructor(public payload: { id: number }) {}
}

export class AddAttachmentType {
  public static readonly type = '[AttachmentTypes] Add item';
  constructor(public payload: Partial<SimpleEditModel>) {}
}

export class EditAttachmentType {
  public static readonly type = '[AttachmentTypes] Edit item';
  constructor(public payload: WithId<SimpleEditModel>) {}
}

export class DeleteAttachmentType {
  public static readonly type = '[AttachmentTypes] Delete item';
  constructor(public payload: number) {}
}
