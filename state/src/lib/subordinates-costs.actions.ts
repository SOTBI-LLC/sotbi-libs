import { CostRealFilter } from '@sotbi/models';

export class FetchSubordinatesCosts {
  public static readonly type = '[subordinates_costs] Read items';

  constructor(public payload: CostRealFilter) {}
}
export class SetSubordinatesFilter {
  public static readonly type = '[subordinates_costs] Set Filter';

  constructor(public payload: CostRealFilter) {}
}
