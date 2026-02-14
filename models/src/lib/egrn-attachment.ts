import type { EgrnRequest } from './egrn-request';
import { UploadResult } from './upload-result';
import type { User } from './user';

export class IAttachment extends UploadResult {
  public id = 0;
  public type: string | null = null;
  public link_name: string | null = null;
}

export interface EgrnAttachment extends Partial<IAttachment> {
  type: EgrnAttachmentType | null;
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
