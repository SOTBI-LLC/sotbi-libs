import type { Debtor } from './debtor';
import type { Interval } from './period';
import type { Project } from './project';
import type { User } from './user';
import type { WorkCategory } from './work-category';

export interface ProjectCost {
  id?: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: Date;
  user?: User;
  user_id: number;
  project?: Project;
  project_id: number;
  month: Date;
  total_percent?: number;
  total_hours?: number;
  rating?: number;
  costs?: Cost[];
  week_costs?: WeekCost[];
}

export interface Cost {
  id?: number;
  CreatedAt?: Date;
  UpdatedAt?: Date;
  DeletedAt?: Date;
  date: Date;
  percent_cost?: number;
  hours_cost?: number;
  project_cost_id?: number;
}

export interface WeekCost {
  week: number;
  percent_cost?: number;
  hours_cost?: number;
}

export interface ResultUserCost {
  user: string;
  percent: number;
  rating: number;
}

export interface CostReal {
  id: number;
  date: Date;
  user_id: number;
  user?: User;
  debtor_id: number;
  debtor?: Debtor;
  minutes_costs: number;
  description: string;
  work_category_id: number;
  work_category?: WorkCategory;
  dirty: boolean;
  rowId?: string;
}

export interface CostRealAnalyticsMonth extends CostReal {
  unit1_id: number;
  unit1: string;
  unit2_id: number;
  unit2: string;
  project_id: number;
  project_name: string;
  rpg_id: number;
  rpg: string;
  debtor_id: number;
  debtor_name: string;
  client_id: number;
  client_name: string;
  total_seconds: number;
  total_percent: number;
}

export interface CostMonitoring
  extends Omit<
    CostRealAnalyticsMonth,
    | 'id'
    | 'date'
    | 'debtor_id'
    | 'description'
    | 'work_category_id'
    | 'project_id'
    | 'project_name'
    | 'rpg_id'
    | 'rpg'
    | 'debtor_name'
    | 'total_seconds'
    | 'total_percent'
  > {
  tasks_count: number;
  minutes_costs: number;
  minutes_costs_min: number;
  minutes_costs_max: number;
  minutes_costs_avg: number;
  worktime_deviation: number;
  task_quality: number;
}

export interface ResponseCostMonitoring {
  costs_monitorings: CostMonitoring[];
  workdays_count: number;
}

export class CostRealFilter {
  public period?: Interval;
  public users: Uint16Array | number[] = [];
  public debtors: Uint32Array | number[] = [];
  public units: Uint16Array | number[] = [];
}

export const calcSumHours = (items: CostReal[]): number => {
  return items.reduce((accum: number, item: CostReal) => {
    accum += item?.minutes_costs ?? 0;
    return accum;
  }, 0);
};
