import type { Project } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchProjects {
  public static readonly type = '[PROJECTS] Fetch items';
}
export class FetchAllProjects {
  public static readonly type = '[PROJECTS] Fetch all items';
}

export class GetProject {
  public static readonly type = '[PROJECTS] Get item';
  constructor(public payload: number) {}
}

export class AddProject {
  public static readonly type = '[PROJECTS] Add item';
  constructor(public payload: Partial<Project>) {}
}

export class EditProject {
  public static readonly type = '[PROJECTS] Edit item';
  constructor(public payload: WithId<Project>) {}
}

export class DeleteProject {
  public static readonly type = '[PROJECTS] Delete item';
  constructor(public payload: number) {}
}
