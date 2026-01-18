import { Employee } from '@sotbi/models';

export class GetEmployees {
  public static readonly type = '[EMPLOYEE] Get all items';
  constructor(public payload: string) {}
}

export class UpdateEmployees {
  public static readonly type = '[EMPLOYEE] Update items';
  constructor(public payload: Partial<Employee>[]) {}
}
