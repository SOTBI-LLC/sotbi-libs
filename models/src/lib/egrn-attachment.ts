import { EgrnRequest } from './egrn-request';
import { UploadResult } from './upload-result';
import { User } from './user';

export interface IAttachment extends UploadResult {
  id?: number;
  type?: string;
  link_name?: string;
}

export interface EgrnAttachment extends Partial<IAttachment> {
  type?: EgrnAttachmentType;
  egrn_request_id?: number;
  egrn_request?: EgrnRequest;
  creator_id?: number;
  creator?: User;
  updated_at?: Date;
}

export enum EgrnAttachmentType {
  AUTHORITY = 'authority',
  REF = 'ref',
  LIST = 'list',
  RESULT = 'result',
}
