export class PerformancePeriod {
  public year = 2026;
  public month = 1;
  public is_active = false;
  public starts_at = new Date();
  public ends_at = new Date();
  constructor(init: Partial<PerformancePeriod> = {}) {
    Object.assign(this, init);
  }
}

export class BaseCriteria {
  public id = 0;
  public name = '';
  public description = '';
  public max_score = 0;
  public valid_from = new Date();
  public valid_to = new Date();
  constructor(init: Partial<BaseCriteria> = {}) {
    Object.assign(this, init);
  }
}

export class PerformanceCriteria {
  public id = 0;
  public name = '';
  public description = '';
  public max_score = 0;
  public is_absolute = false;
  public valid_from = new Date();
  public valid_to = new Date();
  constructor(init: Partial<PerformanceCriteria> = {}) {
    Object.assign(this, init);
  }
}

export class UserPercentage {
  public base_percent = 0;
  public absolute_percent = 0;
  public total_percent = 0;
  constructor(init: Partial<UserPercentage> = {}) {
    Object.assign(this, init);
  }
}

export interface UserPercentageRequest {
  user_id: number;
  year: number;
  month: number;
}
