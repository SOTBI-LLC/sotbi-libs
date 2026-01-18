export class FetchRequests {
  public static readonly type = '[REQUEST_TYPE] Fetch item';
}

export class GetRequest {
  public static readonly type = '[REQUEST_TYPE] Get item';
  constructor(public payload: number) {}
}
