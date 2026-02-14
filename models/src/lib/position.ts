import type { User, UserGroup } from './user';

export class Position {
  public id = 0;
  public name = '';
  public description = '';
  public user_group_id = 0;
  public user_group: UserGroup | null = null;
  public settings = 0;
  public staff_type_id = 0;
  public updated_by = 0;
  public updated: User | null = null;
  public dirty = false;
}
