import type { SimpleEdit2Model } from './simple-edit';
import type { User } from './user';

/**
 * Selected state for tree view items.
 * Replaces @clr/angular's ClrSelectedState for framework-agnostic usage.
 */
export type ClrSelectedState = boolean | 'indeterminate';

export interface Staff {
  id: number;
  parent_id: number;
  name: string;
  type?: number;
  staff_type?: SimpleEdit2Model;
  user_id?: number;
  user?: User;
  user_name?: string;
  active?: boolean;
  path?: string;
  children?: Staff[];
  idArr?: number[];
  selected?: ClrSelectedState;
  staffs_histories?: StaffHistory[];
  updated_at?: Date;
  updated_by?: User;
  updated_by_id?: number;
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
  StaffTypeArr.map((i): [number, string] => [i.id, i.ru])
);
