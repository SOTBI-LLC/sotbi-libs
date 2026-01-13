import { Staff } from './staff';

export interface WorkCategory {
  id: number;
  name: string | null;
  staff?: Staff;
  staff_id: number | null;
  type: WorkCategoryType | null;
  dirty: boolean;
}

export enum WorkCategoryType {
  PROJECT = 'project',
  NEAR = 'near',
}

export const WorkCategoryArr: { id: WorkCategoryType; ru: string }[] = [
  { id: WorkCategoryType.PROJECT, ru: 'Проектные' },
  { id: WorkCategoryType.NEAR, ru: 'Околопроектные' },
];

export const WorkCategoryStatusMap = new Map(
  WorkCategoryArr.map((i): [string, string] => [i.id, i.ru]),
);
