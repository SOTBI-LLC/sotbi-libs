import type { SimpleEdit2Model } from '@sotbi/models';

export class FetchProcedures {
  public static readonly type = '[PROCEDURE] Fetch all procedures';
}

export class GetProcedure {
  public static readonly type = '[PROCEDURE] Get item';
  constructor(public payload: number) {}
}

export class AddProcedure {
  public static readonly type = '[PROCEDURE] Add item';
  constructor(
    public payload: Partial<SimpleEdit2Model> & { id: number | string },
  ) {}
}

export class EditProcedure {
  public static readonly type = '[PROCEDURE] Edit item';
  constructor(
    public payload: Partial<SimpleEdit2Model> & { id: number | string },
  ) {}
}

export class DeleteProcedure {
  public static readonly type = '[PROCEDURE] Delete item';
  constructor(public payload: number) {}
}
