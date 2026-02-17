import type { RequestType, RequestTypeEnum, Transition } from '@sotbi/models';

export class CreateTransition {
  public static readonly type = '[TRANSITION] Create item';
  constructor(public payload: Partial<Transition>) {}
}

export class FetchTransitions {
  public static readonly type = '[TRANSITION] Read items';
  constructor(public payload: RequestTypeEnum) {}
}

export class GetTransition {
  public static readonly type = '[TRANSITION] Read item';
  constructor(public payload: number) {}
}

export class UpdateTransition {
  public static readonly type = '[TRANSITION] Update item';
  constructor(public payload: Transition) {}
}

export class DeleteTransition {
  public static readonly type = '[TRANSITION] Delete item';
  constructor(public payload: number) {}
}
export class AddEmptyTransition {
  public static readonly type = '[TRANSITION] Add empty item';
  constructor(public payload: RequestType) {}
}
