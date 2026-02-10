export interface BidState {
  id: number;
  order: number | null;
  name: string | null;
  description: string | null;
  dirty: boolean;
}
