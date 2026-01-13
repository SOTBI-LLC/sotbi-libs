export interface Employee {
  id: number;
  counterparty_id: number | null;
  position: string;
  position_type: PositionType;
  contour_type: ContourType;
  start: Date;
  stop: Date | null;
  user_id: number | null;
  user_name: string | null;
  // user: User | null;
  is_work_now?: boolean; // фронтовое поле, для показа-скрытия поля stop (дата увольнения)
}

export enum PositionType {
  FullTime = 'Основное',
  PartTime = 'По совместительству',
}

export const PositionTypeArr: string[] = [PositionType.FullTime, PositionType.PartTime];

export enum ContourType {
  Internal = 'Внутренний',
  External = 'Внешний',
}

export const ContourTypeArr: string[] = [ContourType.Internal, ContourType.External];
