export interface DateDifference {
  years: number;
  months: number;
}

export const getDateDifference = (date1: Date, date2: Date): DateDifference => {
  let earlierDate: Date;
  let laterDate: Date;

  if (date1 > date2) {
    laterDate = date1;
    earlierDate = date2;
  } else {
    laterDate = date2;
    earlierDate = date1;
  }

  let yearsDifference = laterDate.getFullYear() - earlierDate.getFullYear();
  let monthsDifference = laterDate.getMonth() - earlierDate.getMonth();

  // If the day of the later date is less than the day of the earlier date, subtract a month.
  if (laterDate.getDate() < earlierDate.getDate()) {
    monthsDifference--;
  }

  // If the months difference is negative, subtract a year and add 12 to the month.
  if (monthsDifference < 0) {
    yearsDifference--;
    monthsDifference += 12;
  }

  return {
    years: yearsDifference,
    months: monthsDifference,
  };
};
