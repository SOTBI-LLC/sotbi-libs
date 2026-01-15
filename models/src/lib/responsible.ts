import type { User } from './user';

export interface Responsible {
  id: number;
  userId: number;
  user: User;
}
