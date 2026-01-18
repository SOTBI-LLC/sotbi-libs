export class GetDadataInformationByInn {
  public static readonly type = '[DADATA] Fetch items';
  constructor(public inn: string) {}
}
