import { ProjectCost } from './cost';
import { Debtor } from './debtor';
import { SimpleEditModel } from './simple-edit';
import { Staff } from './staff';
import { ClrSelectedState } from './staff';

export interface Project {
  id: number;
  name: string; //          Проект (Название)
  client?: SimpleEditModel; // Клиент
  client_id?: number;
  department?: Staff;
  department_id?: number; //   Партнер
  group?: Staff;
  group_id?: number; //        РПГ
  manager?: Staff;
  manager_id?: number; //      Менеджер
  saler_group?: Staff;
  saler_group_id?: number; //      Торгаши
  condition?: ConditionType; // Состояние
  project_costs?: ProjectCost[];
  debtors?: Debtor[];
  selected?: ClrSelectedState;
  created_at?: Date;
}

export enum ConditionType {
  ENTRY = 'entry',
  ACTIVE = 'active',
  ENDING = 'ending',
  FINISHED = 'finished',
}

export const conditionArr: { id: ConditionType; ru: string }[] = [
  { id: ConditionType.ENTRY, ru: 'На входе' },
  { id: ConditionType.ACTIVE, ru: 'В активной работе' },
  { id: ConditionType.ENDING, ru: 'Завершение' },
  { id: ConditionType.FINISHED, ru: 'Окончен' },
];

export const conditionMap = new Map(conditionArr.map((i): [string, string] => [i.id, i.ru]));
