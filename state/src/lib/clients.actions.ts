import type { SimpleEditModel } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class FetchClients {
  public static readonly type = '[CLIENTS] Fetch all clients';
}

export class GetClient {
  public static readonly type = '[CLIENTS] Get item';
  constructor(public payload: number) {}
}

export class AddClient {
  public static readonly type = '[CLIENTS] Add item';
  constructor(public payload: Partial<SimpleEditModel>) {}
}

export class EditClient {
  public static readonly type = '[CLIENTS] Edit item';
  constructor(public payload: WithId<SimpleEditModel>) {}
}

export class DeleteClient {
  public static readonly type = '[CLIENTS] Delete item';
  constructor(public payload: number) {}
}
