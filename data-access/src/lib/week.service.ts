import type { Week } from '@sotbi/models';

export class WeekService {
  constructor(year = 0) {
    if (year === 0) {
      year = new Date().getFullYear();
    }

    const weeks = this.weekInYear(year);
    for (let weekNo = 1; weekNo <= weeks; weekNo++) {
      const firstYearDay = new Date(year, 0, 1);
      const startDay = new Date(
        year,
        0,
        2 - firstYearDay.getDay() + (weekNo - 1) * 7,
      );
      const endDay = new Date(year, 0, 1 - firstYearDay.getDay() + weekNo * 7);
      this._weeks.push({ weekNo, startDay, endDay });
    }
  }

  public get weeks(): Array<Week> {
    return this._weeks;
  }
  private _weeks: Week[] = [];
  public static years = [
    2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
    2025, 2026, 2027, 2028, 2029, 2030,
  ];

  public weekInYear(year: number) {
    let newWeeks = 50;
    while (
      new Date(year, 0, 1 - new Date(year, 0, 1).getDay() + newWeeks * 7) <
      new Date(year + 1, 0, 2)
    ) {
      newWeeks++;
    }
    return newWeeks - 1;
  }
}
