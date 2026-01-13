import { EgrnRequest } from './egrn-request';
import { IAttachment } from './egrn-attachment';
import { User } from './user';

export interface RealEstate extends IAttachment {
  id: number;
  egrn_request_id: number;
  egrn_request?: EgrnRequest;
  cadastral_no?: string;
  parameters?: string;
  request_num?: string;
  key?: string;
  description?: string;
  doer_id: number;
  doer?: User;
}
