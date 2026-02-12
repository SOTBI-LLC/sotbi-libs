import type { ActionPlan } from './actionplan';
import type { Arbitration } from './arbitration';
import type { BankDetail } from './bankdetail';
import type { Bankruptcy } from './bankruptcy';
import type { Bidding } from './bidding';
import type { InsurancePolicy } from './insurance-policy';
import type { Link } from './link';
import type { Project } from './project';
import type { Property } from './property';
import type { SimpleEdit2Model, SimpleEditModel } from './simple-edit';
import type { ClrSelectedState } from './staff';

export interface Debtor {
  id: number;
  name: string; // Должник (наименование)
  full_name: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  post_address: string;
  post_address_match?: boolean;
  arbitration?: Arbitration;
  arbitration_id: string;
  case_no: string;
  decision_date?: Date;
  initiation_date?: Date;
  procedure_date?: Date;
  bankruptcy_manager_id: number;
  bankruptcy_manager?: Bankruptcy;
  biddings?: Bidding[];
  contacts?: string;
  bank_details?: BankDetail[];
  project_id: number;
  project?: Project;
  project_name?: string;
  stage_id?: number; // Стадия
  stage?: SimpleEditModel;
  kind?: boolean; // Вид, TRUE=физ.лицо FALSE=юр.лицо
  reportable?: boolean; // Выводить ли должника в отчет для клиента
  category_id?: number;
  category?: SimpleEdit2Model;
  procedure_id?: number;
  procedure?: SimpleEdit2Model;
  links?: Link[]; // Таблица ссылок: Тип | Значение
  registry?: number; //          Общий РТК (все очереди)
  deposit?: number; //           Общая сумма сопровождаемых требований
  not_deposit?: number; //       Сумма сопровождаемых требований, обеспеченных залогом
  deposit_share?: number; //     от реестра с залогом (наблюдение)
  not_deposit_share?: number; // от реестра без залога (конкурс)
  assets?: SimpleEditModel[]; // Виды ценного имущества
  properties?: Property[]; // Список имущества
  targets?: SimpleEditModel[]; //     Поставленные цели
  persons?: SimpleEditModel[]; //    Представляемые лица
  incomes?: SimpleEdit2Model[]; //    Источники дохода
  expenses?: SimpleEdit2Model[]; //  Статьи расходов
  income_date?: Date; //    Плановая дата получения прибыли
  comments?: string; //     Комментарий к финансовому плану
  profit_cat?: SimpleEditModel; // Категория прибыльности
  profit_cat_id?: number;
  created_at?: Date; // Дата добавления должника в базу
  action_plans?: ActionPlan[]; // Планируемые процедуры
  insurance_policies?: InsurancePolicy[]; // Страховые полисы
  updated_at?: Date;
  selected?: boolean | ClrSelectedState;
}

export interface DebtorsList {
  id?: number;
  name: string; // Должник (наименование)
  debtor_created_at: Date;
  full_name: string;
  koordinator: string;
  group1: string;
  group2: string;
  state: string;
  inn: string;
  kpp: string;
  ogrn: string;
  address: string;
  post_address: string;
  arbitration_name: string;
  case_no: string;
  decision_date: Date;
  initiation_date?: Date;
  procedure_date?: Date;
  bankruptcy_name: string;
  bankruptcy_manager_id?: number;
  sro: string;
  contacts?: string;
  project_id: number;
  project?: Project;
  project_name: string;
  project_created_at: Date;
  stage_name?: string; // Стадия
  kind?: string;
  category_name?: string;
  procedure_name?: string;
  registry?: number; //          Общий РТК (все очереди)
  deposit?: number; //           Общая сумма сопровождаемых требований
  not_deposit?: number; //       Сумма сопровождаемых требований, обеспеченных залогом
  deposit_share?: number; //     от реестра с залогом (наблюдение)
  not_deposit_share?: number; // от реестра без залога (конкурс)
  reportable?: string;
  comments?: string; //     Комментарий к финансовому плану
  profit_cat_name?: string;
  links: Link[]; // Таблица ссылок: Тип | Значение
  property?: Property[]; // Список имущества
  assets?: SimpleEditModel[]; // Виды ценного имущества
  created_at?: Date; // Дата добавления должника в базу
}
