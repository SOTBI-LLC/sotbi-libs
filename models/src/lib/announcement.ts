import type { User } from './user';

export interface Announcement {
  id: number;
  title: string | null;
  new: boolean; // false по умолчанию
  content: string | null;
  link?: string;
  img?: string;
  description?: string;
  creator_id: number;
  creator?: User;
  date_publish?: DatePublish; // в базе не храним
  start: Date | null;
  end: Date | null;
  created_at?: Date;
  updated_at?: Date;
  author?: User;
  author_id: number;
}

export enum DatePublish {
  NOW = 'now',
  LATER = 'later',
}
