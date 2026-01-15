import type { User } from '@sotbi/models';

export class Login {
  public static readonly type = '[AUTH] Login';
  constructor(public payload: { username: string; password: string }) {}
}
export class RefreshToken {
  public static readonly type = '[AUTH] RefreshToken';
  constructor(public payload: string) {}
}
export class LoginAs {
  public static readonly type = '[AUTH] LoginAs';
  constructor(public payload: number) {}
}

export class Logout {
  public static readonly type = '[AUTH] Read items';
}

export class Restore {
  public static readonly type = '[AUTH] Restore from storage';
}

export class GetAccess {
  public static readonly type = '[AUTH] Get access list';
}

export class UpdateMe {
  public static readonly type = '[AUTH] Update my Settings';
  constructor(public payload: Partial<User>) {}
}
