import { Announcement } from '@sotbi/models';

export class FetchItems {
  public static readonly type = '[ANNOUNCEMENT] Fetch items';
  constructor(
    public payload: {
      all: boolean;
      refresh: boolean;
      show_planned?: boolean;
      omit_img?: boolean;
    } = { all: false, refresh: false, show_planned: false, omit_img: false },
  ) {}
}

export class GetItem {
  public static readonly type = '[ANNOUNCEMENT] Get item';
  constructor(public readonly payload: number) {}
}

export class AddItem {
  public static readonly type = '[ANNOUNCEMENT] Add item';
  constructor(public readonly payload: Partial<Announcement>) {}
}

export class UpdateItem {
  public static readonly type = '[ANNOUNCEMENT] Update item';
  constructor(public readonly payload: Partial<Announcement>) {}
}

export class DeleteItem {
  public static readonly type = '[ANNOUNCEMENT] Delete item';
  constructor(public readonly payload: number) {}
}
