import type { SimpleEditModel } from '@sotbi/models';

export class FetchTargetTypes {
  public static readonly type = '[TARGETS] Fetch target types';
}

export class GetTarget {
  public static readonly type = '[TARGETS] Get item';
  constructor(public payload: number) {}
}

export class AddTarget {
  public static readonly type = '[TARGETS] Add item';
  constructor(public payload: SimpleEditModel) {}
}

export class EditTarget {
  public static readonly type = '[TARGETS] Edit item';
  constructor(public payload: SimpleEditModel) {}
}

export class DeleteTarget {
  public static readonly type = '[TARGETS] Delete item';
  constructor(public payload: number) {}
}
