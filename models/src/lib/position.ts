import { User, UserGroup } from './user';

export interface Position {
  id: number;
  name: string;
  description?: string;
  user_group_id: number;
  user_group?: UserGroup;
  settings: number;
  staff_type_id: number;
  updated_by: number;
  updated?: User;
  dirty: boolean;
}

export const emptyPosition: Position = {
  id: null as unknown as number,
  name: '',
  settings: null as unknown as number,
  updated_by: null as unknown as number,
  user_group_id: null as unknown as number,
  staff_type_id: null as unknown as number,
  dirty: false,
};
