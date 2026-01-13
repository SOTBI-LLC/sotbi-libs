export interface Interval {
  start: Date;
  end: Date;
}

export interface IPeriod extends Interval {
  month?: number;
  year?: number;
}
