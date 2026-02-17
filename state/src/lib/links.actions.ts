import type { SimpleEditModel } from '@sotbi/models';

export class FetchLinkTypes {
  public static readonly type = '[LINKS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetLink {
  public static readonly type = '[LINKS] Get item';
  constructor(public payload: number) {}
}

export class AddLink {
  public static readonly type = '[LINKS] Add item';
  constructor(public payload: string) {}
}

export class EditLink {
  public static readonly type = '[LINKS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteLink {
  public static readonly type = '[LINKS] Delete item';
  constructor(public payload: number) {}
}
