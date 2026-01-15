import type { StatusEvent } from './event';
import type { RequestType } from './request-type';
import type { StatusEnum } from './status-request';

export interface Transition {
  id: number;
  state: StatusEnum[];
  next_state: StatusEnum | null;
  request_type_id: number;
  request_type?: RequestType | null;
  events?: StatusEvent[];
}
