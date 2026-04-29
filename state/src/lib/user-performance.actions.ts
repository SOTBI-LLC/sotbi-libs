import type { UserPerformance } from '@sotbi/models';

export class UserPerformanceAction {
  public static readonly type = '[UserPerformance] Add item';
  constructor(public readonly payload: UserPerformance) {}
}
