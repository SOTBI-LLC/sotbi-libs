import type { Project } from '@sotbi/models';

export class FetchProjects {
  public static readonly type = '[PROJECTS] Fetch items';
}
export class FetchAllProjects {
  public static readonly type = '[PROJECTS] Fetch all items';
}

export class GetItem {
  public static readonly type = '[PROJECTS] Get item';
  constructor(public payload: number) {}
}

export class AddItem {
  public static readonly type = '[PROJECTS] Add item';
  constructor(public payload: Partial<Project>) {}
}

export class EditItem {
  public static readonly type = '[PROJECTS] Edit item';
  constructor(public payload: Project) {}
}

export class DeleteItem {
  public static readonly type = '[PROJECTS] Delete item';
  constructor(public payload: number) {}
}
