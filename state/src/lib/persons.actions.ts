import type { SimpleEditModel } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchPersons {
  public static readonly type = '[PERSONS] Fetch items';
  // constructor(public payload: { type: string }) {}
}

export class GetPerson {
  public static readonly type = '[PERSONS] Get item';
  constructor(public payload: { id: number }) {}
}

export class AddPerson {
  public static readonly type = '[PERSONS] Add item';
  constructor(public payload: Partial<SimpleEditModel>) {}
}

export class EditPerson {
  public static readonly type = '[PERSONS] Edit item';
  constructor(public payload: WithId<SimpleEditModel>) {}
}

export class DeletePerson {
  public static readonly type = '[PERSONS] Delete item';
  constructor(public payload: number) {}
}
