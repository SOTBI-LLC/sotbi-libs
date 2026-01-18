import { Counterparty } from '@sotbi/models';

/** GetCounterparties Action Class */
export class GetCounterparties {
  public static readonly type = '[COUNTERPARTY] get counterparties';
  /**
   * Get Counterparties from backend if not in cache
   * @constructor
   */
  constructor() {}
}

/** GetCounterparty Action Class */
export class GetCounterparty {
  public static readonly type = '[COUNTERPARTY] get counterparty';
  /**
   * Get Counterparties from DB
   * @constructor
   * @param {string} payload - base62 encoded ID of counterparty
   */
  constructor(public readonly payload: string) {}
}

/** AddCounterparty Action Class */
export class AddCounterparty {
  public static readonly type = '[COUNTERPARTY] add counterparty';
  /**
   * Add Counterparty to DB
   * @constructor
   * @param {Partial<Counterparty>} payload - Counterparty object
   */
  constructor(public readonly payload: Partial<Counterparty>) {}
}

/** UpdateCounterparty Action Class */
export class UpdateCounterparty {
  public static readonly type = '[COUNTERPARTY] update counterparty';
  /**
   * Update Counterparty to DB
   * @constructor
   * @param {Partial<Counterparty>} payload - Counterparty object
   */
  constructor(public readonly payload: Partial<Counterparty>) {}
}

/** DeleteCounterparty Action Class */
export class DeleteCounterparty {
  public static readonly type = '[COUNTERPARTY] delete counterparty';
  /**
   * Delete Counterparty to DB
   * @constructor
   * @param {number} id - id
   */
  constructor(public readonly payload: number) {}
}
