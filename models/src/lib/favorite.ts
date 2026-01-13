import { Debtor } from './debtor';
import { User } from './user';

export interface Favorite {
  id: number;
  debtor_id: number;
  debtor?: Debtor;
  user_id: number;
  user: User;
}
