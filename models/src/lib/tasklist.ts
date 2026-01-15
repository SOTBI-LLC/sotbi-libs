import type { Attachment } from './attachment';
import type { SimpleEditModel } from './simple-edit';
import type { User } from './user';

export interface TaskHistory {
  id?: number;
  taskListId: number;
  user?: User;
  userId?: number;
  comment?: string;
  complete?: boolean;
  mandatory?: boolean;
  updatedAt?: Date;
}

export interface TaskListType {
  id?: number;
  sequence: number;
  mandatory?: boolean;
  isbidcode?: boolean;
  attachmentType?: SimpleEditModel;
  attachmentTypeId?: number;
  name: string;
}

export interface TaskList {
  id?: number;
  organisation_id: number;
  complete: boolean;
  doerId: number;
  doer?: User;
  sequence: number;
  mandatory?: boolean;
  isbidcode?: boolean;
  name: string;
  attachmentType?: SimpleEditModel;
  attachmentTypeId?: number;
  attachment?: Attachment[];
  updatedAt?: Date;
  expanded?: boolean;
  TaskHistories?: Array<TaskHistory>;
}
