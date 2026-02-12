import type { Label } from '@sotbi/models';

export class FetchLabels {
  public static readonly type = '[LABELS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetLabel {
  public static readonly type = '[LABELS] Get item';
  constructor(public payload: number) {}
}

export class AddLabel {
  public static readonly type = '[LABELS] Add item';
  constructor(public payload: Partial<Label>) {}
}

export class EditLabel {
  public static readonly type = '[LABELS] Edit item';
  constructor(public payload: Label) {}
}

export class DeleteLabel {
  public static readonly type = '[LABELS] Delete item';
  constructor(public payload: number) {}
}
