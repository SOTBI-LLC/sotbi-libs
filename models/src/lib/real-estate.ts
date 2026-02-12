import type { IAttachment } from './egrn-attachment';
import type { EgrnRequest } from './egrn-request';
import type { User } from './user';

export interface RealEstate extends IAttachment {
  id: number;
  egrn_request_id: number;
  egrn_request: EgrnRequest | null;
  cadastral_no: string | null;
  parameters: string | null;
  request_num: string | null;
  key: string | null;
  description: string | null;
  doer_id: number;
  doer: User | null;
}
