import type { Position } from './position';
import type { Staff } from './staff';
import type { UserScan } from './user-scan';

export class UserShort {
  public id = 0;
  public user = '';
  public avatar = '';
}

export interface User extends UserShort {
  uuid: Uint16Array;
  name: string;
  email: string;
  phone: string;
  hired: Date;
  fired: Date;
  password: string;
  data: Date;
  role: number;
  user_group_id: number;
  group: UserGroup;
  position_id: number;
  users_positions: UserPosition[];
  unit1_id: number;
  unit1: string;
  unit2_id: number;
  unit2: string;
  settings: number; // хранятся данные по отображению энергозатрат
  staffs?: Staff; // штатное расписане
  staff_type: number;
  update_at: Date; // дата обновления
  updated_by: number;
  surname: string; // фамилия
  patronymic: string; //
  birthday: Date; // дата рождения
  passport_series: string; // серия паспорта
  passport_number: string; // номер паспорта
  passport_date: Date; // дата выдачи паспорта
  passport_issued: string; // кем выдан паспорт
  inn: string; // инн
  snils: string; // снилс
  diploma: string; // диплом
  mobile: string; // мобильный телефон
  external_email: string; // внешний email
  tg_nik: string; // ник в телеграмме
  registration_address: string; // адрес регистрации
  actual_address: string; // фактический адрес
  scans: UserScan[]; // сканы документов
  selected?: boolean;
  foto?: string;
  fotoPassport?: string;
  fotoPassportName?: string;
  fotoDiplom?: string;
  fotoDiplomName?: string;
}

export interface UsersHistory extends User {
  action: string;
  revision: number;
  dt_datetime: Date;
}

export interface UserGroup {
  id: number;
  name: string;
  label: string;
  level: number;
  home: string;
}

export interface UserPosition {
  id: number | null;
  date: Date;
  user_id?: number | null;
  position_id?: number | null;
  position?: Position | null;
  updated_at?: Date;
  updated_by?: Partial<User> | null;
  updated_by_id?: number | null;
  dirty?: boolean;
}

export const useFavBit = 8;

export enum SettingsType {
  ISFILLING,
  WORKCATEGORIES,
  DESCRIPTION,
  HOLDING,
}

export const SettingsTypeArr: {
  id: SettingsType;
  name: string;
  toolTip: string;
}[] = [
  {
    id: SettingsType.ISFILLING,
    name: 'Сдает',
    toolTip: 'Заполняет ли трудозатраты в принципе',
  },
  {
    id: SettingsType.WORKCATEGORIES,
    name: 'Категории работ',
    toolTip: 'Заполняет или нет категории работ',
  },
  {
    id: SettingsType.DESCRIPTION,
    name: 'Описание',
    toolTip: 'Заполняет или нет описание работы',
  },
  {
    id: SettingsType.HOLDING,
    name: '100% Холдинг',
    toolTip: '100% к холдингу или нет',
  },
];

export interface HeadDepartmentChef {
  id: number;
  user_id: number;
  user_name: string;
}

export interface HeadDepartment {
  id: number;
  name: string;
}
