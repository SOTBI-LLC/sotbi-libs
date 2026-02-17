import type { Calendar } from '@sotbi/models';
import type { WithId } from '@sotbi/utils';

export class GetActivePeriods {
  public static readonly type = '[CALENDAR] get active periods';
  constructor(public payload = false) {}
}

export class GetMonth {
  public static readonly type = '[CALENDAR] get work days of one month';
  constructor(public payload: string) {}
}

export class TogglePeriod {
  public static readonly type = '[CALENDAR] Open/Close period for filling';
  constructor(public payload: WithId<Calendar>) {}
}

export class RefreshPeriod {
  public static readonly type = '[CALENDAR] Refersh period statistic';
  constructor(public payload: Date) {}
}
