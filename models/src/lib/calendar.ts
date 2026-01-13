export interface Calendar {
  id: number;
  month: string;
  first_day_month: Date;
  editable: boolean;
  completed_users?: number;
  not_completed_users?: number;
  projects?: number;
  working_days: Date[][];
  holidays: Date[];
  loading?: boolean;
}

export interface Week {
  weekNo: number;
  startDay: Date;
  endDay: Date;
}
