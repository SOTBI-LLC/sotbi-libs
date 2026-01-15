import type { Attachment } from './attachment';
import type { TradingCode } from './bidcode';
import type { Bidding } from './bidding';
import type { Debtor } from './debtor';
import type { Initiator } from './initiator';
import type { Progress } from './progress';
import type { Project } from './project';
import type { Responsible } from './responsible';
import type { SimpleEdit2Model } from './simple-edit';
import type { TaskList } from './tasklist';
import type { User } from './user';

export interface Advert {
  id: number;
  week: number; //             required, Неделя
  bidding: Bidding;
  biddingId: number; //        required, if (debtorId), Положение о торгах
  debtor: Debtor;
  debtorId: number; //         required, Должник
  trading_code: TradingCode;
  trading_code_id: number; //    required, if (advert.kind), Код торгов
  advertId: number; //         required, if (debtorId && biddingId), Тип объявления
  advert: SimpleEdit2Model;
  advertOther: string;
  organiser: Initiator;
  organiserId: number; //      required, Организатор торгов
  responsible: Responsible;
  responsibleId: number; //    required, if (creating || Role >= moderator), Ответственный
  project: Project;
  projectId: number; //        required, Код проекта
  lawyerId: number;
  lawyer: User;
  taskLists?: TaskList[];
  attachments?: Attachment[];
  comment: string;
  progress: Progress;
  requestCount: number;
  lotsCount: number;
  creator: User;
  created_at: Date;
}
