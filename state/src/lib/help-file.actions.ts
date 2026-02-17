import type { HelpFile } from '@sotbi/models';

export class FetchHelpFiles {
  public static readonly type = '[HELP FILE] Fetch items';
}

export class AddHelpFile {
  public static readonly type = '[HELP FILE] Add item';
  constructor(public payload: { idx: number; item: Partial<HelpFile> }) {}
}

export class AddEmptyHelpFile {
  public static readonly type = '[HELP FILE] Add empty item';
}

export class UpdateHelpFile {
  public static readonly type = '[HELP FILE] Update item';
  constructor(public payload: HelpFile) {}
}

export class StartEditHelpFile {
  public static readonly type = '[HELP FILE] Start edit item';
  constructor(public payload: number) {}
}

export class DeleteHelpFile {
  public static readonly type = '[HELP FILE] Delete item';
  constructor(public payload: number) {}
}
