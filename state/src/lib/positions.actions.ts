import { Position } from '@sotbi/models';

export class FetchPositions {
  public static readonly type = '[POSITIONS] Fetch items';
}

export class GetPosition {
  public static readonly type = '[POSITIONS] Get item';
  constructor(public payload: number) {}
}

export class EditPosition {
  public static readonly type = '[POSITIONS] Edit item';
  constructor(public payload: { idx: number; position: Partial<Position> }) {}
}

export class AddPosition {
  public static readonly type = '[POSITIONS] Add item';
  constructor(public payload: { idx: number; position: Partial<Position> }) {}
}

export class AddEmptyPosition {
  public static readonly type = '[POSITIONS] Add empty item';
}
export class SaveAllPositions {
  public static readonly type = '[POSITIONS] Save all item';
}

export class UpdatePosition {
  public static readonly type = '[POSITIONS] Update item';
  constructor(public payload: { idx: number; position: Partial<Position> }) {}
}

export class CancelPosition {
  public static readonly type = '[POSITIONS] Cancel edited item';
  constructor(public payload: number) {}
}

/* export class EmptyPosition {
  public static readonly type = '[POSITIONS] Empty not saved item';
  public constructor(public payload: number) {}
} */

export class DeletePosition {
  public static readonly type = '[POSITIONS] Delete item';
  constructor(public payload: number) {}
}
