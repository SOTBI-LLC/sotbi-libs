import type { Calendar } from '@sotbi/models';

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
  constructor(public payload: Partial<Calendar> & { id: number | string }) {}
}

export class RefreshPeriod {
  public static readonly type = '[CALENDAR] Refersh period statistic';
  constructor(public payload: Date) {}
}
