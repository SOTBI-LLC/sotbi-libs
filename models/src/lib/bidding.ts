import type { Advert } from './advert';
import type { TradingCode } from './bidcode';
import type { Initiator } from './initiator';

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
