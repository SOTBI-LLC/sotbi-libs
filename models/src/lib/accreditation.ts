import type { Initiator } from './initiator';
import type { Sro } from './sro';
import type { User } from './user';

export interface Accreditation {
  id: number;
  initiator_id: number;
  initiator: Initiator;
  accreditation_type: string;
  sro_id: number;
  sro: Sro;
  start: Date;
  end: Date;
  fee: number;
  interest_rate: number;
  editor: User;
  editor_id: number;
}
