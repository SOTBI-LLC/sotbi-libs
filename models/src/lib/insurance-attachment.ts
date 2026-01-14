import { IAttachment } from './egrn-attachment';
import { User } from './user';

export interface InsuranceAttachment extends IAttachment {
  type: InsuranceAttachmentType;
  created_at?: Date;
  updated_at?: Date;
  updated_by?: number;
  updater?: User;
  insurance_policy_id?: number;
}

export enum InsuranceAttachmentType {
  POLICY = 'policy',
  INQUIRER = 'inquirer',
}

export const InsuranceAttachmentTypeArr: {
  id: InsuranceAttachmentType;
  ru: string;
}[] = [
  { id: InsuranceAttachmentType.POLICY, ru: 'Полис' },
  { id: InsuranceAttachmentType.INQUIRER, ru: 'Опросник' },
];

export const InsuranceAttachmentTypeMap = new Map(
  InsuranceAttachmentTypeArr.map((i): [string, string] => [i.id, i.ru])
);
