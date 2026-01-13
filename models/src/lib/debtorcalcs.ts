export interface Calcs {
  id: number;
  name: string;
  inn: string;
  initiatorName?: string;
  initiatorId?: number;
  expense: number;
  compensation: number;
  compensation_paid: number;
  reward: number;
  reward_paid: number;
  adverts: number;
  biddingId?: number;
  biddings?: number;
  cost?: number; // Внутренняя стоимость
  transfer?: number; // Передано в проект
}

export interface InitiatorCalcs {
  id: number;
  name: string;
  expense: number;
  compensation: number;
  compensation_paid: number;
  reward: number;
  reward_paid: number;
  cost: number;
  transfer: number;
}
