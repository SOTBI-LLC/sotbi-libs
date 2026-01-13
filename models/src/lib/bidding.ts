import { Advert } from './advert';
import { TradingCode } from './bidcode';
import { Initiator } from './initiator';

export interface Bidding {
  id?: number;
  name: string;
  description?: string;
  debtorId: number;
  initiatorId: number;
  initiator?: Initiator;
  adverts?: Advert[];
  trading_codes?: TradingCode[];
}
