import type { SimpleEdit2Model } from './simple-edit';
import type { User } from './user';

/**
 * Selected state for tree view items.
 * Replaces @clr/angular's ClrSelectedState for framework-agnostic usage.
 */
export type ClrSelectedState = boolean | 'indeterminate';

export class Staff {
  public id = 0;
  public parent_id: number | null = null;
  public name = '';
  public type = 0;
  public staff_type: SimpleEdit2Model | null = null;
  public user_id = 0;
  public user: User | null = null;
  public user_name = '';
  public active = false;
  public path = '';
  public children: Staff[] = [];
  public idArr: number[] = [];
  public selected: ClrSelectedState = false;
  public staffs_histories: StaffHistory[] = [];
  public updated_at: Date | null = null;
  public updated_by: User | null = null;
  public updated_by_id = 0;
}

export interface StaffFlat {
  id: number;
  unit1?: string;
  unit2?: string;
  active: boolean;
  working_users: number;
  fired_users: number;
  all_users: number;
}

export interface StaffChronicle extends StaffUnit {
  id: number;
  date: Date;
  user_id: number;
  user: User;
  parent_id: number;
  parent: Staff;
  updated_at: Date;
  updated_by_id: number;
  updated_by: User;
}

export interface StaffUnit {
  unit1_id: number;
  unit1: Staff;
  unit2_id: number;
  unit2: Staff;
}

export interface StaffAndChronicle {
  staffs: Staff[];
  staffs_chronicles: StaffChronicle[];
}

export interface StaffHistory {
  id: number;
  updated_at: Date;
}

export interface StaffChart {
  id: number;
  parent_id: number;
  label: string;
  position: string;
  phone: string;
  email: string;
  type: string;
  active: boolean;
  employees: StaffChart[];
  children: StaffChart[];
}

export enum StaffGroupType {
  ALL = 0,
  WORKGROUP,
  DEPARTMENT,
  MANAGER,
  SALES,
}

export interface StaffsHistory extends Staff {
  action: string;
  revision: number;
  dt_datetime: Date;
}

export enum StaffActive {
  FALSE = 'false',
  TRUE = 'true',
}

export const StaffActiveArr: { id: StaffActive; ru: string }[] = [
  { id: StaffActive.FALSE, ru: 'Неактивное' },
  { id: StaffActive.TRUE, ru: 'Активное' },
];

export enum StaffType {
  DIVISION = 4,
  DEPARTMENT,
}

export const StaffTypeArr: { id: StaffType; ru: string }[] = [
  { id: StaffType.DIVISION, ru: 'Отдел' },
  { id: StaffType.DEPARTMENT, ru: 'Департамент' },
];

export const StaffTypeMap = new Map(
  StaffTypeArr.map((i): [number, string] => [i.id, i.ru]),
);
