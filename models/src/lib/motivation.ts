export class PerformancePeriod {
  public id = 0;
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
  public year = 0;
  public month = 0;
  public department_id = 0;
  /*  public valid_from = new Date();
  public valid_to = new Date(); */
  constructor(init: Partial<PerformanceCriteria> = {}) {
    Object.assign(this, init);
  }
}

export class UserPerformance {
  public id = 0;
  public user_id = 0;
  public staff_id = 0;
  public criteria_id = 0;
  public earned_score = 0;
  public comment = '';
  public evaluated_at = new Date();
  public evaluated_by = 0;
  constructor(init: Partial<UserPerformance> = {}) {
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

// новое

/* export interface MotivationEmployee {
  id: number;
  fullName: string;
  email: string;
  position: string;
  department: string;
  avatar?: string;
  basePercent: number;
  totalPercent: number;
  averagePercent: number;
  color?: 'success' | 'warning' | 'danger';
}

export interface CriterionWithScore {
  id: number;
  criteria_id: number;
  name: string;
  description: string;
  max_score: number;
  is_absolute: boolean;
  earned_score: number; // из UserPerformance
  comment?: string;
  sign: '+' | '-'; // для отображения
} */

export interface PerformanceCriteriaRequest {
  year: number;
  month: number;
  department_id?: number;
  user_id?: number;
}

export interface SelectedPeriod {
  year: number;
  month: number;
}
